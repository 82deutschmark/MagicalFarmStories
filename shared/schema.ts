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

export const CHARACTERS = [
  {
    id: "cow",
    name: "Clara the Cow",
    svg: `<svg viewBox="0 0 100 100"><!-- Friendly cow SVG art here --></svg>`,
  },
  {
    id: "chicken",
    name: "Charlie the Chicken",
    svg: `<svg viewBox="0 0 100 100"><!-- Friendly chicken SVG art here --></svg>`,
  },
  {
    id: "pig",
    name: "Percy the Pig",
    svg: `<svg viewBox="0 0 100 100"><!-- Friendly pig SVG art here --></svg>`,
  },
] as const;
