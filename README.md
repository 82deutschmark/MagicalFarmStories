# Uncle Mark's Magical Farm - Children's Interactive Storytelling Web App

A web application that generates personalized magical farm adventures using advanced AI technologies. The platform leverages OpenAI's Assistants API to create unique narratives by analyzing selected farm animal characters and generating imaginative stories.

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

## Known Issues and Debugging

### Current Issues:
1. Story Page Not Loading:
   - After character selection, the /story/:characterId route shows "Character not found"
   - Need to verify character ID passing and decoding
   - Check if image base64 conversion is working properly

2. OpenAI Assistant Integration:
   - Thread creation and message handling needs verification
   - Assistant runs may not be properly monitored
   - Response parsing might need adjustment

### Debugging Steps:
1. Verify Routes:
   - Check RouterComponent.tsx for correct route handling
   - Ensure character selection navigation is working
   - Verify URL encoding/decoding of character IDs
   - Expected route: /story/:characterId where characterId is URL-encoded

2. Image Processing:
   - Monitor base64 conversion in story.tsx
   - Verify image data is correctly passed to OpenAI Vision API
   - Check browser console for image loading errors
   - Ensure image paths in the database are valid and accessible

3. Assistant API Flow:
   - Confirm thread creation on character selection
   - Verify message addition and run creation
   - Check run status polling and completion handling
   - Expected sequence:
     1. Create thread -> Returns thread_id
     2. Analyze image with Vision API
     3. Add analysis as message to thread
     4. Run assistant on thread
     5. Poll for completion and retrieve story

4. Database Integration:
   - Verify farm_images table structure
   - Ensure thread IDs are being stored with image metadata
   - Required fields:
     * storyMakerId (UUID)
     * imageBase64 (Text)
     * description (Text)
     * threadId (Text)
     * analyzedByAI (Boolean)
     * selectionCount (Integer)

### Verifying the Implementation:
1. Check Environment Variables:
   ```bash
   echo $OPENAI_API_KEY  # Should show valid API key
   echo $VITE_ASSISTANT_ID  # Should show asst_ZExL77IkNDUHucztPYSeHnLw
   ```

2. Monitor Network Requests:
   - Use browser DevTools Network tab
   - Check POST requests to /api/analyze-image
   - Verify thread creation and message addition
   - Monitor assistant run status

3. Check Server Logs:
   - Watch for successful thread creation
   - Monitor Vision API responses
   - Track assistant run completion
   - Look for any error messages

4. Database Verification:
   ```sql
   -- Check farm_images table structure
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'farm_images';

   -- Verify image data
   SELECT storyMakerId, description, threadId, analyzedByAI 
   FROM farm_images 
   LIMIT 5;
   ```

Please follow these steps when debugging the application. For issues with the OpenAI Assistants API integration, refer to the official documentation at https://platform.openai.com/docs/assistants/overview