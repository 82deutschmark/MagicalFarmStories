
import { API_URL } from "./config";

export async function analyzeCharacterImage(imageBase64: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
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
    const response = await fetch(`${API_URL}/api/generate-story`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        characterName,
        characterDescription,
        additionalPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate story");
    }

    const data = await response.json();
    return data.story;
  } catch (error) {
    console.error("Error generating story:", error);
    return "Once upon a time on Uncle Mark's magical farm...";
  }
}

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
      throw new Error("Failed to generate illustration");
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating illustration:", error);
    return "";
  }
}

export async function saveStory(
  character: string,
  characterImage: string,
  storyText: string,
  illustration: string | null
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        character,
        characterImage,
        storyText,
        illustration,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save story");
    }
  } catch (error) {
    console.error("Error saving story:", error);
    throw error;
  }
}
