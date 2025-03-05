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
- AI Integration: OpenAI API (GPT-4 Vision and DALL-E)
- Styling: Tailwind CSS with shadcn/ui components

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=your_openai_api_key
VITE_ASSISTANT_ID=your_assistant_id
```

## API Endpoints

- GET /api/farm-images: Retrieve random farm animal characters
- POST /api/analyze-image: Analyze character using OpenAI Vision
- POST /api/generate-story: Generate a story based on character
- POST /api/generate-illustration: Create story illustrations
- POST /api/stories: Save generated stories

## Database Schema

### Farm Images Table
- Stores farm animal characters
- Tracks selection count and AI analysis status
- Maintains image descriptions

### Stories Table
- Stores generated stories
- Links to farm images
- Includes generated illustrations

## Development Notes

The application is set up to run on Replit with automatic workflow management. The Express backend serves both the API and the Vite frontend on port 5000.
