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

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find(msg => msg.role === "assistant");

    if (!assistantMessage?.content[0]) {
      throw new Error("No response from assistant");
    }

    const content = assistantMessage.content[0];
    if (content.type !== 'text') {
      throw new Error("Unexpected response type from assistant");
    }

    return content.text.value;
  } catch (error) {
    console.error("Error generating story:", error);
    return "Once upon a time on Uncle Mark's farm... (Sorry, I'm having trouble telling the story right now)";
  }
}

async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (run.status === 'completed') {
      return;
    } else if (run.status === 'failed' || run.status === 'cancelled') {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Assistant run timed out');
}

export async function generateIllustration(storyText: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a child-friendly, colorful illustration for this story: ${storyText}. 
      Style: Whimsical, magical farm setting with cute animals.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data[0].url || "";
}