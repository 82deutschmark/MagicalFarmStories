import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeCharacterImage, generateStory, generateIllustration } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StoryDisplay from "@/components/story-display";
import { apiRequest } from "@/lib/queryClient";

export default function Story() {
  const { toast } = useToast();
  const { characterId } = useParams();
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [storyText, setStoryText] = useState("");
  const [illustration, setIllustration] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string | null>(null);

  // Decode the URL-encoded image path
  const imagePath = characterId ? decodeURIComponent(characterId) : null;

  if (!imagePath) {
    return <div>Image not found</div>;
  }

  // Function to convert image to base64
  useEffect(() => {
    const convertImageToBase64 = async () => {
      try {
        const response = await fetch(imagePath);
        const blob = await response.blob();

        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix
            const base64 = base64String.split(',')[1];
            setImageBase64(base64);
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast({
          title: "Error",
          description: "Failed to load image. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    };

    convertImageToBase64();
  }, [imagePath, toast]);

  const { data: analyzedDescription, isLoading: isAnalyzing } = useQuery({
    queryKey: ['/api/analyze-image', imagePath],
    queryFn: async () => {
      if (!imageBase64) {
        return "";
      }
      const response = await apiRequest("POST", "/api/analyze-image", { imageBase64 });
      const description = response.description || "";
      setImageDescription(description);
      return description;
    },
    enabled: !!imageBase64
  });

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      // Use the character name from the image description or a default name
      const characterName = "Farm Friend";
      
      const story = await generateStory(
        characterName,
        analyzedDescription || "",
        additionalPrompt
      );
      setStoryText(story);
      return story;
    }
  });

  const generateIllustrationMutation = useMutation({
    mutationFn: async () => {
      const url = await generateIllustration(storyText);
      setIllustration(url);
      return url;
    }
  });

  const saveStoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/stories", {
        character: imagePath,
        characterImage: imagePath,
        storyText,
        illustration
      });
    },
    onSuccess: () => {
      toast({
        title: "Story saved!",
        description: "Your magical tale has been saved successfully."
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Create Your Story</h2>
            <img src={imagePath} alt="Selected Farm Friend" className="w-48 h-48 object-cover mb-4 rounded-lg" />

            {analyzedDescription && (
              <p className="text-gray-600 italic mb-4">{analyzedDescription}</p>
            )}

            <Textarea
              placeholder="Add any special details for your story..."
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              className="mb-4"
            />

            <Button
              onClick={() => generateStoryMutation.mutate()}
              disabled={generateStoryMutation.isPending}
            >
              {generateStoryMutation.isPending ? "Creating Story..." : "Generate Story"}
            </Button>
          </div>

          {storyText && (
            <StoryDisplay
              characterImage={imagePath}
              story={storyText}
              illustration={illustration}
              onGenerateIllustration={() => generateIllustrationMutation.mutate()}
              onSaveStory={() => saveStoryMutation.mutate()}
              isGeneratingIllustration={generateIllustrationMutation.isPending}
              isSaving={saveStoryMutation.isPending}
            />
          )}
        </Card>
      </div>
    </div>
  );
}