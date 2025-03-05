import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeCharacterImage, generateStory, generateIllustration } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StoryDisplay from "@/components/story-display";

interface StoryState {
  characterDescription: string;
  threadId: string | null;
  storyText: string;
  illustration: string | null;
}

export default function Story() {
  const { toast } = useToast();
  const { characterId } = useParams();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [storyState, setStoryState] = useState<StoryState>({
    characterDescription: "",
    threadId: null,
    storyText: "",
    illustration: null
  });

  // Decode the URL-encoded image path
  const imagePath = characterId ? decodeURIComponent(characterId) : null;

  if (!imagePath) {
    return <div>Character not found</div>;
  }

  // Convert image to base64
  useEffect(() => {
    const convertImageToBase64 = async () => {
      try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64 = base64String.split(',')[1];
          setImageBase64(base64);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast({
          title: "Error",
          description: "Failed to load character image. Please try again.",
          variant: "destructive",
        });
      }
    };

    convertImageToBase64();
  }, [imagePath, toast]);

  // Analyze image and create thread
  const { isLoading: isAnalyzing } = useQuery({
    queryKey: ['/api/analyze-image', imagePath],
    queryFn: async () => {
      if (!imageBase64) return null;

      const result = await analyzeCharacterImage(imageBase64);

      setStoryState(prev => ({
        ...prev,
        characterDescription: result.description,
        threadId: result.threadId
      }));

      return result;
    },
    enabled: !!imageBase64
  });

  // Generate story using the Assistant
  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      if (!storyState.threadId) throw new Error("No thread ID available");

      const result = await generateStory(
        storyState.threadId,
        storyState.characterDescription,
        additionalPrompt
      );

      setStoryState(prev => ({
        ...prev,
        threadId: result.threadId,
        storyText: result.story
      }));

      return result;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate illustration
  const generateIllustrationMutation = useMutation({
    mutationFn: async () => {
      const url = await generateIllustration(storyState.storyText);
      setStoryState(prev => ({
        ...prev,
        illustration: url
      }));
      return url;
    }
  });

  // Save story
  const saveStoryMutation = useMutation({
    mutationFn: async () => {
      return fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          character: imagePath,
          characterImageId: storyState.threadId,
          storyText: storyState.storyText,
          illustration: storyState.illustration
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your magical tale has been saved!",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Create Your Story</h2>

            {/* Character Preview */}
            <div className="flex items-start gap-6 mb-6">
              <img 
                src={imagePath} 
                alt="Selected Farm Friend" 
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Your Farm Friend</h3>
                {storyState.characterDescription && (
                  <p className="text-gray-600 italic mb-4">{storyState.characterDescription}</p>
                )}
              </div>
            </div>

            {/* Story Tuning */}
            {storyState.characterDescription && !storyState.storyText && (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Add Special Details for Your Story
                  </label>
                  <Textarea
                    placeholder="What magical adventure would you like your farm friend to have?"
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    className="h-32"
                  />
                </div>
                <Button
                  onClick={() => generateStoryMutation.mutate()}
                  disabled={generateStoryMutation.isPending}
                  className="w-full"
                >
                  {generateStoryMutation.isPending ? "Creating Story..." : "Generate Story"}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="text-center py-8">
                <p>Analyzing your farm friend...</p>
              </div>
            )}

            {/* Story Display */}
            {storyState.storyText && (
              <StoryDisplay
                characterImage={imagePath}
                story={storyState.storyText}
                illustration={storyState.illustration}
                onGenerateIllustration={() => generateIllustrationMutation.mutate()}
                onSaveStory={() => saveStoryMutation.mutate()}
                isGeneratingIllustration={generateIllustrationMutation.isPending}
                isSaving={saveStoryMutation.isPending}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}