import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  character: text("character").notNull(),
  characterImage: text("character_image").notNull(),
  storyText: text("story_text").notNull(),
  illustration: text("illustration"),
});

export const insertStorySchema = createInsertSchema(stories).pick({
  character: true,
  characterImage: true,
  storyText: true,
  illustration: true,
});

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

// Farm images available for selection
export const FARM_IMAGES = [
  "/images/animal1.png",
  "/images/animal2.png", 
  "/images/animal3.png",
  "/images/animal4.png",
  "/images/animal5.png",
  "/images/animal6.png"
];