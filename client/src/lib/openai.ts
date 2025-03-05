import { API_URL, ASSISTANT_ID } from './constants';

export interface Thread {
  id: string;
  object: string;
  created_at: number;
}

export interface RunResponse {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: string;
  last_error?: {
    code: string;
    message: string;
  };
}

// Create a new thread for story generation
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

// Add a message to a thread
export async function addMessageToThread(
  threadId: string, 
  content: string
): Promise<string> {
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

    const data = await response.json();
    return data.id;
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

// Check run status and get completion
export async function getRunCompletion(threadId: string, runId: string): Promise<string> {
  try {
    let status = "in_progress";
    let attempts = 0;
    const maxAttempts = 30;

    while (status === "in_progress" && attempts < maxAttempts) {
      const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs/${runId}`);

      if (!response.ok) {
        throw new Error(`Failed to check run status: ${response.status}`);
      }

      const data = await response.json() as RunResponse;
      status = data.status;

      if (status === "completed") {
        // Get the latest messages
        const messagesResponse = await fetch(`${API_URL}/api/openai/threads/${threadId}/messages`);

        if (!messagesResponse.ok) {
          throw new Error(`Failed to get messages: ${messagesResponse.status}`);
        }

        const messagesData = await messagesResponse.json();
        const assistantMessages = messagesData.messages.filter((msg: any) => msg.role === "assistant");

        if (assistantMessages.length > 0) {
          return assistantMessages[0].content[0].text.value;
        }
      }

      if (status === "failed") {
        throw new Error("Assistant run failed");
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error(attempts >= maxAttempts ? "Timed out" : "Failed to generate story");
  } catch (error) {
    console.error("Error getting run completion:", error);
    throw error;
  }
}

// Generate a story using the Assistant
export async function generateStory(
  threadId: string | null,
  characterName: string,
  characterDescription: string,
  additionalPrompt: string
): Promise<{ story: string; threadId: string }> {
  try {
    // Create a new thread if none provided
    if (!threadId) {
      const thread = await createThread();
      threadId = thread.id;
    }

    // Add the story context and prompt to the thread
    const prompt = `Create a magical children's story about ${characterName}. 
Character description: ${characterDescription}
Additional elements to include: ${additionalPrompt}

Make it appropriate for young children, with a positive message, around 300-400 words.`;

    await addMessageToThread(threadId, prompt);

    // Run the assistant
    const run = await runAssistant(threadId);

    // Get the generated story
    const story = await getRunCompletion(threadId, run.id);

    return { story, threadId };
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

// Analyze character image using Vision API
export async function analyzeCharacterImage(
  imageBase64: string
): Promise<{ description: string; threadId: string }> {
  try {
    // Create a new thread for this story session
    const thread = await createThread();

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

export const analyzeImage = async (imageBase64: string, storyMakerId: string) => {
  try {
    const response = await axios.post('/api/analyze-image', {
      imageBase64,
      storyMakerId
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};