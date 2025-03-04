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

export async function registerRoutes(app: Express) {
  const router = Router();
  
  // Set up multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Get 3 random images from database
  router.get("/api/farm-images", async (req, res) => {
    try {
      const images = await db.select().from(farmImages).orderBy(sql`RANDOM()`).limit(3);
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

  // Image upload route
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

  // Register our API routes
  app.use(router);
  const httpServer = createServer(app);
  return httpServer;
}