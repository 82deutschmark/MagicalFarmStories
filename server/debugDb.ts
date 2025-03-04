
import { db } from "./db";
import { farmImages, stories } from "@shared/schema";
import { sql } from "drizzle-orm";

async function createTables() {
  try {
    console.log("Creating tables...");
    
    // Create the farm_images table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS farm_images (
        id SERIAL PRIMARY KEY,
        story_maker_id TEXT NOT NULL UNIQUE,
        image_base64 TEXT NOT NULL,
        original_file_name TEXT,
        description TEXT,
        analyzed_by_ai BOOLEAN DEFAULT false,
        selection_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create the stories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        character TEXT NOT NULL,
        character_image_id TEXT NOT NULL,
        story_text TEXT NOT NULL,
        illustration TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

async function dropTables() {
  try {
    console.log("Dropping tables...");
    await db.execute(sql`DROP TABLE IF EXISTS ${stories} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${farmImages} CASCADE`);
    console.log("Tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
  }
}

async function printTableInfo() {
  try {
    console.log("Database tables information:");
    
    // List all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Tables in database:", tables.rows);
    
    // Count rows in farm_images
    const farmImagesCount = await db.execute(sql`
      SELECT COUNT(*) FROM farm_images
    `).catch(() => ({ rows: [{ count: "Table doesn't exist" }] }));
    
    console.log("Farm images count:", farmImagesCount.rows[0]?.count || 0);
    
    // Count rows in stories
    const storiesCount = await db.execute(sql`
      SELECT COUNT(*) FROM stories
    `).catch(() => ({ rows: [{ count: "Table doesn't exist" }] }));
    
    console.log("Stories count:", storiesCount.rows[0]?.count || 0);
  } catch (error) {
    console.error("Error getting table information:", error);
  }
}

// For command line usage
if (process.argv[2] === "create") {
  createTables().then(() => process.exit(0));
} else if (process.argv[2] === "drop") {
  dropTables().then(() => process.exit(0));
} else if (process.argv[2] === "info") {
  printTableInfo().then(() => process.exit(0));
}

export { createTables, dropTables, printTableInfo };
