# Uncle Mark's Magical Farm - Children's Storytelling Web App

A web application that generates custom stories about Uncle Mark's Magical Farm using OpenAI's API. Children can select farm animal characters and get unique, personalized stories with AI-generated illustrations.

## Features

- Character Selection: Choose from various farm animal characters
- AI-Powered Story Generation: Creates unique stories based on selected characters
- Image Analysis: Uses OpenAI's Vision API to analyze characters
- Story Illustrations: Generates custom illustrations using DALL-E
- Story Saving: Save and revisit generated stories

## Technical Stack

- Frontend: React with TypeScript
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- AI Integration: OpenAI Assistant API for contextual story generation
- Styling: Tailwind CSS with shadcn/ui components

## OpenAI Integration

### Assistant Configuration
- Assistant ID: `asst_ZExL77IkNDUHucztPYSeHnLw`
- Purpose: Generates contextual farm-themed stories based on analyzed images
- Maintains conversation context through thread IDs

### Application Flow
1. Homepage: Displays three random farm animal characters from the database
2. Image Analysis:
   - When a character is selected, its base64 data is sent to OpenAI's Vision API
   - The analysis response and thread_ID are stored with image metadata
3. Story Tuning:
   - Displays the selected character and its AI-generated description
   - Accepts additional story parameters from the user
4. Story Generation:
   - Uses the dedicated Assistant (asst_ZExL77IkNDUHucztPYSeHnLw)
   - Maintains context by passing the thread_ID from the image analysis
   - Generates a unique, contextual story based on the character and user inputs

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=your_openai_api_key
VITE_ASSISTANT_ID=asst_ZExL77IkNDUHucztPYSeHnLw
```

## API Endpoints

- GET /api/farm-images: Retrieve random farm animal characters
- POST /api/analyze-image: Analyze character using OpenAI Vision
- POST /api/openai/threads: Create new conversation thread
- POST /api/openai/threads/:threadId/messages: Add messages to thread
- POST /api/openai/threads/:threadId/runs: Run the assistant
- GET /api/openai/threads/:threadId/runs/:runId: Check run status
- POST /api/generate-illustration: Create story illustrations
- POST /api/stories: Save generated stories

## Database Schema

### Farm Images Table
- Stores farm animal characters
- Tracks selection count and AI analysis status
- Maintains image descriptions and associated thread IDs

### Stories Table
- Stores generated stories
- Links to farm images
- Includes generated illustrations

## Development Notes

The application is set up to run on Replit with automatic workflow management. The Express backend serves both the API and the Vite frontend on port 5000. Story generation uses OpenAI's Assistant API with a dedicated assistant for maintaining context throughout the story creation process.