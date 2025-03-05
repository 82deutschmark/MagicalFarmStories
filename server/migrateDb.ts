
import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // Check if thread_id column exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'farm_images' AND column_name = 'thread_id'
    `);
    
    // If column doesn't exist, add it
    if (checkResult.rows.length === 0) {
      console.log('Adding thread_id column to farm_images table...');
      await db.execute(sql`
        ALTER TABLE farm_images
        ADD COLUMN thread_id TEXT
      `);
      console.log('thread_id column added successfully!');
    } else {
      console.log('thread_id column already exists, no migration needed.');
    }
    
    console.log('Database migration complete!');
  } catch (error) {
    console.error('Error during database migration:', error);
  }
}

// Run the migration
migrateDatabase();
