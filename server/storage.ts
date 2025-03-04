import { type Story, type InsertStory } from "@shared/schema";

export interface IStorage {
  createStory(story: InsertStory): Promise<Story>;
  getAllStories(): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
}

export class MemStorage implements IStorage {
  private stories: Map<number, Story>;
  private currentId: number;

  constructor() {
    this.stories = new Map();
    this.currentId = 1;
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentId++;
    const story: Story = { id, ...insertStory };
    this.stories.set(id, story);
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return Array.from(this.stories.values());
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }
}

export const storage = new MemStorage();
