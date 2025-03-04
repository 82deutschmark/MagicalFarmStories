
import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const farmImages = pgTable("farm_images", {
  id: serial("id").primaryKey(),
  storyMakerId: text("story_maker_id").notNull().unique(),
  imageBase64: text("image_base64").notNull(),
  originalFileName: text("original_file_name"),
  description: text("description"),
  analyzedByAI: boolean("analyzed_by_ai").default(false),
  selectionCount: integer("selection_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  character: text("character").notNull(),
  characterImageId: text("character_image_id").notNull(), // References storyMakerId
  storyText: text("story_text").notNull(),
  illustration: text("illustration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFarmImageSchema = createInsertSchema(farmImages).pick({
  storyMakerId: true,
  imageBase64: true,
  originalFileName: true,
  description: true,
  analyzedByAI: true,
  selectionCount: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  character: true,
  characterImageId: true,
  storyText: true,
  illustration: true,
});

export type InsertFarmImage = z.infer<typeof insertFarmImageSchema>;
export type FarmImage = typeof farmImages.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
