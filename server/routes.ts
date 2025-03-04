import type { Express } from "express";
import { createServer } from "http";
import { Router } from "express";
import { OpenAI } from "openai";
import { storage } from "./storage";
import { insertStorySchema, farmImages } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

// Check if API key is missing
if (!process.env.VITE_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn("Warning: No OpenAI API key found in environment variables. Please set VITE_OPENAI_API_KEY in the secrets tool.");
}

import { createTables, dropTables, printTableInfo } from "./debugDb";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import AdmZip from "adm-zip";

export async function registerRoutes(app: Express) {
  const router = Router();
  
  // Set up multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for ZIP files
    fileFilter: (req, file, cb) => {
      // Accept image files and ZIP files
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/zip') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Get farm images from database with flexible options
  router.get("/api/farm-images", async (req, res) => {
    try {
      // Extract query parameters
      const count = req.query.count ? parseInt(req.query.count as string) : 3;
      const limit = count > 0 && count <= 10 ? count : 3; // Default to 3, max 10
      const orderBy = req.query.orderBy as string || 'random'; // Default to random ordering
      const excludeIds = req.query.excludeIds ? (req.query.excludeIds as string).split(',').map(id => parseInt(id)) : [];
      const character = req.query.character as string;
      
      // Start building the query
      let query = db.select().from(farmImages);
      
      // Apply filters based on query parameters
      if (excludeIds.length > 0) {
        query = query.where(sql`${farmImages.id} NOT IN (${excludeIds.join(',')})`);
      }
      
      if (character) {
        // If we have character filtering implemented in the future
        // query = query.where(sql`${farmImages.character} = ${character}`);
      }
      
      // Apply ordering
      if (orderBy === 'random') {
        query = query.orderBy(sql`RANDOM()`);
      } else if (orderBy === 'newest') {
        query = query.orderBy(sql`${farmImages.createdAt} DESC`);
      } else if (orderBy === 'popular') {
        query = query.orderBy(sql`${farmImages.selectionCount} DESC`);
      }
      
      // Apply limit
      query = query.limit(limit);
      
      // Execute the query
      const images = await query;
      console.log(`Fetched ${images.length} images with parameters:`, { count, orderBy, excludeIds, character });
      
      res.json(images);
    } catch (error) {
      console.error("Error fetching farm images:", error);
      res.status(500).json({ message: "Failed to fetch farm images" });
    }
  });

  // API endpoints
  router.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64, storyMakerId } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ message: "Image data required" });
      }

      if (!storyMakerId) {
        return res.status(400).json({ message: "Story maker ID required" });
      }

      // Check if this image already has a description
      const [existingImage] = await db.select().from(farmImages).where(sql`${farmImages.storyMakerId} = ${storyMakerId}`);
      
      let description;
      
      if (existingImage && existingImage.analyzedByAI && existingImage.description) {
        // Use existing description
        description = existingImage.description;
        console.log("Using existing image description");
      } else {
        // Get new description from OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Describe this farm animal character for a children's story. Focus on appearance, personality traits, and anything unique about it." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
              ],
            },
          ],
          max_tokens: 300,
        });

        description = response.choices[0]?.message?.content || "";
        
        // Update the database with the new description
        await db.update(farmImages)
          .set({ 
            description: description,
            analyzedByAI: true
          })
          .where(sql`${farmImages.storyMakerId} = ${storyMakerId}`);
        
        console.log("Updated image with new AI description");
      }
      
      // Increment the selection count
      await db.update(farmImages)
        .set({ 
          selectionCount: sql`${farmImages.selectionCount} + 1`
        })
        .where(sql`${farmImages.storyMakerId} = ${storyMakerId}`);

      res.json({ description, storyMakerId });
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: error.message || "Failed to analyze image" });
    }
  });

  // Debug routes
  router.get("/api/debug/tables/info", async (req, res) => {
    try {
      await printTableInfo();
      const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const farmImagesCount = await db.execute(sql`
        SELECT COUNT(*) FROM farm_images
      `).catch(() => ({ rows: [{ count: "Table doesn't exist" }] }));
      
      const storiesCount = await db.execute(sql`
        SELECT COUNT(*) FROM stories
      `).catch(() => ({ rows: [{ count: "Table doesn't exist" }] }));
      
      res.json({
        tables: tables.rows,
        counts: {
          farmImages: farmImagesCount.rows[0]?.count || 0,
          stories: storiesCount.rows[0]?.count || 0
        }
      });
    } catch (error) {
      console.error("Error fetching table info:", error);
      res.status(500).json({ message: "Failed to fetch table info", error: String(error) });
    }
  });

  router.post("/api/debug/tables/create", async (req, res) => {
    try {
      await createTables();
      res.json({ message: "Tables created successfully" });
    } catch (error) {
      console.error("Error creating tables:", error);
      res.status(500).json({ message: "Failed to create tables", error: String(error) });
    }
  });

  router.post("/api/debug/tables/drop", async (req, res) => {
    try {
      await dropTables();
      res.json({ message: "Tables dropped successfully" });
    } catch (error) {
      console.error("Error dropping tables:", error);
      res.status(500).json({ message: "Failed to drop tables", error: String(error) });
    }
  });

  // Single image upload route (keeping for backward compatibility)
  router.post("/api/debug/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageFile = req.file;
      const storyMakerId = uuidv4();
      const base64Data = imageFile.buffer.toString('base64');
      
      await db.insert(farmImages).values({
        storyMakerId,
        imageBase64: base64Data,
        originalFileName: imageFile.originalname,
        analyzedByAI: false,
        selectionCount: 0
      });
      
      res.json({ 
        message: "Image uploaded successfully", 
        storyMakerId,
        fileName: imageFile.originalname
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image", error: String(error) });
    }
  });
  
  // Multiple files upload route (handles both multiple images and ZIP files)
  router.post("/api/debug/upload-multiple", upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }
      
      const files = req.files as Express.Multer.File[];
      const results = [];
      let totalProcessed = 0;
      
      for (const file of files) {
        // If it's a ZIP file, extract and process its contents
        if (file.mimetype === 'application/zip') {
          try {
            const zip = new AdmZip(file.buffer);
            const zipEntries = zip.getEntries();
            
            for (const entry of zipEntries) {
              if (!entry.isDirectory && isImageFile(entry.name)) {
                const entryData = entry.getData();
                const base64Data = entryData.toString('base64');
                const storyMakerId = uuidv4();
                
                await db.insert(farmImages).values({
                  storyMakerId,
                  imageBase64: base64Data,
                  originalFileName: entry.name,
                  analyzedByAI: false,
                  selectionCount: 0
                });
                
                results.push({
                  fileName: entry.name,
                  storyMakerId,
                  source: `Extracted from ${file.originalname}`
                });
                
                totalProcessed++;
              }
            }
          } catch (zipError) {
            console.error("Error processing ZIP file:", zipError);
            results.push({
              fileName: file.originalname,
              error: "Failed to process ZIP file"
            });
          }
        } 
        // If it's an image file, process it directly
        else if (file.mimetype.startsWith('image/')) {
          const storyMakerId = uuidv4();
          const base64Data = file.buffer.toString('base64');
          
          await db.insert(farmImages).values({
            storyMakerId,
            imageBase64: base64Data,
            originalFileName: file.originalname,
            analyzedByAI: false,
            selectionCount: 0
          });
          
          results.push({
            fileName: file.originalname,
            storyMakerId
          });
          
          totalProcessed++;
        }
      }
      
      res.json({
        message: `Successfully processed ${totalProcessed} images`,
        results
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files", error: String(error) });
    }
  });
  
  // Helper function to check if a file is an image based on extension
  function isImageFile(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
  }

  // Register our API routes
  app.use(router);
  const httpServer = createServer(app);
  return httpServer;
}