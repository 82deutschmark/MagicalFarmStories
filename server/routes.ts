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

export async function registerRoutes(app: Express) {
  const router = Router();

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

  // Register our API routes
  app.use(router);
  const httpServer = createServer(app);
  return httpServer;
}