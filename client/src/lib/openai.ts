import { API_URL, ASSISTANT_ID } from './constants';

// Types for OpenAI Assistant API responses
export interface Thread {
  id: string;
  object: string;
  created_at: number;
}

export interface Message {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: string;
  content: Array<{
    type: string;
    text?: {
      value: string;
      annotations?: Array<any>;
    };
    image_file?: {
      file_id: string;
    };
  }>;
}

export interface RunResponse {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "cancelled";
  started_at?: number;
  completed_at?: number;
  cancelled_at?: number;
  failed_at?: number;
  last_error?: {
    code: string;
    message: string;
  };
}

// Create a new thread for a story session
export async function createThread(): Promise<Thread> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

// Add a message to an existing thread
export async function addMessageToThread(
  threadId: string,
  content: string
): Promise<Message> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "user",
        content
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

// Run the assistant on a thread
export async function runAssistant(threadId: string): Promise<RunResponse> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run assistant: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
}

// Get messages from a thread
export async function getThreadMessages(threadId: string): Promise<{ messages: Message[] }> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/messages`);

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
}

// Check run status and get completion
export async function getRunStatus(threadId: string, runId: string): Promise<RunResponse> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs/${runId}`);

    if (!response.ok) {
      throw new Error(`Failed to check run status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking run status:", error);
    throw error;
  }
}

// Wait for run completion and get response
export async function waitForRunCompletion(
  threadId: string,
  runId: string,
  maxAttempts = 30
): Promise<string> {
  try {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const run = await getRunStatus(threadId, runId);

      if (run.status === "completed") {
        const { messages } = await getThreadMessages(threadId);
        const assistantMessages = messages.filter(msg => msg.role === "assistant");

        if (assistantMessages.length > 0) {
          const latestMessage = assistantMessages[0];
          return latestMessage.content
            .filter(content => content.type === "text")
            .map(content => content.text?.value)
            .join("\n");
        }
        throw new Error("No assistant messages found");
      }

      if (run.status === "failed") {
        throw new Error(`Run failed: ${run.last_error?.message}`);
      }

      if (run.status === "cancelled") {
        throw new Error("Run was cancelled");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Timed out waiting for run completion");
  } catch (error) {
    console.error("Error waiting for run completion:", error);
    throw error;
  }
}

// Generate a story using the Assistant
export async function generateStory(
  threadId: string | null,
  characterDescription: string,
  additionalPrompt: string
): Promise<{ story: string; threadId: string }> {
  try {
    // Create a new thread if none provided
    if (!threadId) {
      const thread = await createThread();
      threadId = thread.id;
    }

    // Add the story context to the thread
    const prompt = `Create a magical children's story based on this farm character:
${characterDescription}

Additional elements to include: ${additionalPrompt}

The story should be appropriate for young children, have a positive message, and be around 300-400 words.`;

    await addMessageToThread(threadId, prompt);

    // Run the assistant on the thread
    const run = await runAssistant(threadId);

    // Wait for the story to be generated
    const story = await waitForRunCompletion(threadId, run.id);

    return { story, threadId };
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

// Analyze character image using Vision API and create a thread
export async function analyzeCharacterImage(
  imageBase64: string
): Promise<{ description: string; threadId: string }> {
  try {
    // Create a new thread for this story session
    const thread = await createThread();

    // Analyze the image using Vision API
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
        threadId: thread.id
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    return {
      description: data.description,
      threadId: thread.id
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

// Generate illustration using DALL-E
export async function generateIllustration(storyText: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/generate-illustration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storyText }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate illustration: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating illustration:", error);
    throw error;
  }
}

import axios from 'axios';

export const analyzeImage = async (imageBase64: string, storyMakerId: string, id?: number) => {
  try {
    // Check if the image is too large - OpenAI has size limits
    if (imageBase64.length > 20 * 1024 * 1024) { // 20MB limit
      throw new Error("Image is too large to process. Please use a smaller image (under 20MB).");
    }
    
    // Normalize the image format - ensure it's in the format OpenAI expects
    let processedImage = imageBase64;
    
    // If it's already an HTTP URL, use it as is
    if (imageBase64.startsWith('http')) {
      console.log('Using HTTP URL for image analysis');
    } 
    // If it's already a properly formatted data URL, keep it as is
    else if (imageBase64.startsWith('data:image')) {
      console.log('Using existing data URL for image analysis');
    } 
    // Otherwise, assume it's raw base64 data and add the data URL prefix for PNG
    else {
      processedImage = `data:image/png;base64,${imageBase64}`;
      console.log('Formatted raw base64 as PNG data URL for OpenAI');
    }
    
    console.log(`Sending image for analysis (${Math.round(processedImage.length/1024)}KB)`);
    
    const response = await axios.post('/api/analyze-image', {
      imageBase64: processedImage,
      storyMakerId,
      id // Include numeric ID when available
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    
    // Provide more specific error messages based on the error type
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || "Unknown server error";
      
      if (status === 400) {
        throw new Error(`Bad request: ${serverMessage}`);
      } else if (status === 500) {
        throw new Error(`Server error: ${serverMessage}`);
      } else {
        throw new Error(`Error (${status}): ${serverMessage}`);
      }
    }
    
    // For network errors or other issues
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};