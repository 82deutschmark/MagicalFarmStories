import { API_URL } from './constants';

interface RunResponse {
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

interface RunCompletionResponse {
  id: string;
  thread_id: string;
  status: string;
  messages: {
    content: Array<{
      type: string;
      text: {
        value: string;
      };
    }>;
  }[];
}

// The assistant ID from your configuration
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID || '';

export async function analyzeCharacterImage(imageBase64: string, storyMakerId: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64, storyMakerId }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "An adorable farm character with a friendly personality!";
  }
}



// Helper function to create a new thread
async function createThread(): Promise<string> {
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

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

// Helper function to add a message to a thread
async function addMessageToThread(threadId: string, content: string, role: "user" | "system" = "user"): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
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

// Helper function to run the assistant on a thread
async function runAssistant(threadId: string, assistantId: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run assistant: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
}

// Helper function to wait for a run to complete and return the results
async function getRunCompletion(threadId: string, runId: string): Promise<string> {
  try {
    let status = "in_progress";
    let attempts = 0;
    const maxAttempts = 30; // Maximum number of polling attempts

    while (status !== "completed" && status !== "failed" && attempts < maxAttempts) {
      const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check run status: ${response.status}`);
      }

      const data = await response.json() as RunResponse;
      status = data.status;

      if (status === "failed") {
        throw new Error("Assistant run failed");
      }

      if (status !== "completed") {
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error("Timed out waiting for assistant to complete");
    }

    // Get the latest messages
    const messagesResponse = await fetch(`${API_URL}/api/openai/threads/${threadId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to get messages: ${messagesResponse.status}`);
    }

    const messagesData = await messagesResponse.json();
    // Extract the latest assistant message
    const assistantMessages = messagesData.messages.filter((msg: any) => msg.role === "assistant");

    if (assistantMessages.length > 0) {
      // Get the content from the latest assistant message
      const latestMessage = assistantMessages[0];
      // Extract text content
      const textContent = latestMessage.content
        .filter((content: any) => content.type === "text")
        .map((content: any) => content.text.value)
        .join('\n');

      return textContent;
    }

    throw new Error("No assistant messages found");
  } catch (error) {
    console.error("Error getting run completion:", error);
    throw error;
  }
}

import axios from 'axios';

/**
 * Analyzes an image using OpenAI's Vision API via the server endpoint
 */
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


export const generateStory = async (
  characterName: string,
  characterDescription: string,
  additionalPrompt: string
): Promise<string> => {
  try {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterName,
        characterDescription,
        additionalPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate story: ${response.statusText}`);
    }

    const data = await response.json();
    return data.story;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};


/**
 * Polls the run status until it's completed or failed
 */
const pollRunStatus = async (threadId: string, runId: string, maxAttempts = 20) => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(`/api/openai/threads/${threadId}/runs/${runId}`);
    const run = response.data;
    
    if (run.status === 'completed') {
      return run;
    } else if (run.status === 'failed' || run.status === 'cancelled') {
      throw new Error(`Run ${runId} ${run.status}`);
    }
    
    // Wait for 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Max polling attempts reached');
};