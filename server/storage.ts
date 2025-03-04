import { db } from "./db";
import { type Story, type InsertStory, type FarmImage, type InsertFarmImage, stories, farmImages } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getAllStories(): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  createFarmImage(image: InsertFarmImage): Promise<FarmImage>;
  getAllFarmImages(): Promise<FarmImage[]>;
  getFarmImage(id: number): Promise<FarmImage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db.insert(stories).values(insertStory).returning();
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return db.select().from(stories);
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async createFarmImage(image: InsertFarmImage): Promise<FarmImage> {
    const [farmImage] = await db.insert(farmImages).values(image).returning();
    return farmImage;
  }

  async getAllFarmImages(): Promise<FarmImage[]> {
    return db.select().from(farmImages);
  }

  async getFarmImage(id: number): Promise<FarmImage | undefined> {
    const [farmImage] = await db.select().from(farmImages).where(eq(farmImages.id, id));
    return farmImage;
  }
}

export const storage = new DatabaseStorage();