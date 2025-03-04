import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const farmImages = pgTable("farm_images", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  character: text("character").notNull(),
  characterImage: text("character_image").notNull(),
  storyText: text("story_text").notNull(),
  illustration: text("illustration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFarmImageSchema = createInsertSchema(farmImages).pick({
  imageUrl: true,
  description: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  character: true,
  characterImage: true,
  storyText: true,
  illustration: true,
});

export type InsertFarmImage = z.infer<typeof insertFarmImageSchema>;
export type FarmImage = typeof farmImages.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;