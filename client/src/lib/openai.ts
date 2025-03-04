
import { API_URL } from "./config";

interface ThreadResponse {
  id: string;
}

interface MessageResponse {
  id: string;
  thread_id: string;
}

interface RunResponse {
  id: string;
  thread_id: string;
  status: string;
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
const ASSISTANT_ID = "asst_ZExL77IkNDUHucztPYSeHnLw";

// Helper function to create a new thread
async function createThread(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.status}`);
    }

    const data = await response.json() as ThreadResponse;
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

    const data = await response.json() as MessageResponse;
    return data.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

// Helper function to run the assistant on a thread
async function runAssistant(threadId: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/openai/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to run assistant: ${response.status}`);
    }

    const data = await response.json() as RunResponse;
    return data.id;
  } catch (error) {
    console.error("Error running assistant:", error);
    throw error;
  }
}

// Helper function to check run status and get messages
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

export async function generateStory(
  characterName: string,
  characterDescription: string,
  additionalPrompt: string
): Promise<string> {
  try {
    // Step 1: Create a new thread
    const threadId = await createThread();
    console.log("Created thread:", threadId);
    
    // Step 2: Add a system message with instructions
    await addMessageToThread(
      threadId,
      "You are a specialist in creating engaging children's stories about farm animals. Create a story about a character based on the description provided.",
      "system"
    );
    
    // Step 3: Add the user message with character details and prompt
    const userMessage = `
Create a children's story about a farm animal character named ${characterName}.
Character description: ${characterDescription}
Additional details: ${additionalPrompt}

The story should be engaging, positive, and suitable for young children. Include a beginning, middle, and end.
    `;
    
    await addMessageToThread(threadId, userMessage);
    
    // Step 4: Run the assistant on the thread
    const runId = await runAssistant(threadId);
    console.log("Started assistant run:", runId);
    
    // Step 5: Wait for completion and get the generated story
    const story = await getRunCompletion(threadId, runId);
    
    return story;
  } catch (error) {
    console.error("Error generating story:", error);
    return "Once upon a time on Uncle Mark's magical farm...";
  }
}

export async function generateIllustration(storyText: string): Promise<string> {
  // This function would be implemented for image generation if needed
  // Not currently implemented
  return "";
}
