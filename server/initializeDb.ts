
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { farmImages } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Function to convert image to base64
function imageToBase64(filePath: string): string {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // First wipe existing tables
    console.log('Wiping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS ${farmImages} CASCADE`);
    
    // Recreate tables (this will happen automatically with drizzle)
    console.log('Tables dropped. They will be recreated automatically.');
    
    // Scan the images directory
    const imagesDir = path.join(__dirname, '../client/public/images');
    
    if (!fs.existsSync(imagesDir)) {
      console.log('Images directory not found. Creating it...');
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      
    console.log(`Found ${imageFiles.length} image files.`);
    
    // Process each image
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const storyMakerId = uuidv4();
      const base64Data = imageToBase64(filePath);
      
      console.log(`Adding image ${file} to database...`);
      
      await db.insert(farmImages).values({
        storyMakerId,
        imageBase64: base64Data,
        originalFileName: file,
        analyzedByAI: false,
        selectionCount: 0
      });
    }
    
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run if this file is executed directly
// Using ES module syntax to check if file is run directly
import { fileURLToPath } from 'url';
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization script finished.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
