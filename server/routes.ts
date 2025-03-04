import type { Express } from "express";
import { createServer } from "http";
import { Router } from "express";
import { OpenAI } from "openai";
import { storage } from "./storage";
import { insertStorySchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import { promises as fs } from "fs";

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express) {
  const router = Router();

  // API endpoints
  router.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ message: "Image data required" });
      }

      // Call OpenAI Vision API to analyze the image
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this farm animal character for a children's story. Focus on appearance, personality traits, and anything unique about it." },
              { type: "image_url", image_url: { url: imageBase64 } }
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

  router.post("/api/generate-story", async (req, res) => {
    try {
      const { characterName, characterDescription, additionalPrompt } = req.body;

      const prompt = `Create a short, magical children's story about a farm animal named ${characterName}. 
      Character description: ${characterDescription}
      Additional elements to include: ${additionalPrompt || "A magical adventure on the farm"}

      The story should be appropriate for young children, have a positive message, and be about 300-400 words.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const story = response.choices[0]?.message?.content || "";
      res.json({ story });
    } catch (error: any) {
      console.error("Error generating story:", error);
      res.status(500).json({ message: error.message || "Failed to generate story" });
    }
  });

  router.post("/api/generate-illustration", async (req, res) => {
    try {
      const { storyText } = req.body;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a child-friendly, colorful illustration for this story: ${storyText}. 
          Style: Whimsical, magical farm setting with cute animals.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0]?.url || "";
      res.json({ imageUrl });
    } catch (error: any) {
      console.error("Error generating illustration:", error);
      res.status(500).json({ message: error.message || "Failed to generate illustration" });
    }
  });

  router.post("/api/stories", async (req, res) => {
    try {
      const data = insertStorySchema.parse(req.body);
      const story = await storage.createStory(data);
      res.json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid story data" });
        return;
      }
      res.status(500).json({ message: "Failed to save story" });
    }
  });

  router.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Register our API routes
  app.use(router);

  const httpServer = createServer(app);
  return httpServer;
}