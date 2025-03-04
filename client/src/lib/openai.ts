import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ASSISTANT_ID = "asst_ZExL77IkNDUHucztPYSeHnLw";

export async function analyzeCharacterImage(base64Image: string): Promise<string> {
  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this farm animal character in a child-friendly way. Focus on their appearance and personality traits that might be visible."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/svg+xml;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    max_tokens: 200,
  });

  return visionResponse.choices[0].message.content || "";
}

export async function generateStory(character: string, description: string, additionalPrompt?: string): Promise<string> {
  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Character: ${character}
Description: ${description}
Additional details: ${additionalPrompt || ""}

Please create a magical story about this character's adventure on Uncle Mark's farm.`
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Poll for completion
    await waitForRunCompletion(thread.id, run.id);

    // Get the messages
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Return the assistant's response
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    if (assistantMessages.length > 0) {
      const latestMessage = assistantMessages[0];
      if (typeof latestMessage.content[0].text === 'object') {
        return latestMessage.content[0].text.value;
      }
      return "";
    }

    return "";
  } catch (error) {
    console.error("Error generating story:", error);
    return "Once upon a time, there was a magical adventure... (Sorry, I couldn't finish the story right now)";
  }
}

async function waitForRunCompletion(threadId: string, runId: string, maxRetries = 10): Promise<void> {
  let retries = 0;

  while (retries < maxRetries) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "completed") {
      return;
    }

    if (runStatus.status === "failed" || runStatus.status === "cancelled") {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Wait for a few seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
    retries++;
  }

  throw new Error("Timed out waiting for assistant response");
}

import { apiRequest } from "./queryClient";

export async function generateIllustration(storyText: string): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/generate-illustration", {
      storyText
    });
    return response.imageUrl || "";
  } catch (error) {
    console.error("Error generating illustration:", error);
    return "";
  }
}

export async function generateStory(
  characterName: string,
  characterDescription: string,
  additionalPrompt: string
): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/generate-story", {
      characterName,
      characterDescription,
      additionalPrompt
    });
    return response.story || "";
  } catch (error) {
    console.error("Error generating story:", error);
    return "";
  }
}