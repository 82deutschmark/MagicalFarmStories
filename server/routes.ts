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
      const images = await db.query(
        'SELECT * FROM farm_images ORDER BY RANDOM() LIMIT 3'
      );
      res.json(images.rows);
    } catch (error) {
      console.error("Error fetching farm images:", error);
      res.status(500).json({ message: "Failed to fetch farm images" });
    }
  });

  // API endpoints
  router.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ message: "Image data required" });
      }

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

      const description = response.choices[0]?.message?.content || "";
      res.json({ description });
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