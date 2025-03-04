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
import { CHARACTERS } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Story() {
  const { toast } = useToast();
  const { characterId } = useParams();
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [storyText, setStoryText] = useState("");
  const [illustration, setIllustration] = useState<string | null>(null);

  const character = CHARACTERS.find(c => c.id === characterId);
  
  if (!character) {
    return <div>Character not found</div>;
  }

  // Convert SVG to base64
  const getBase64Image = () => {
    const base64 = btoa(character.svg);
    return base64;
  };

  const { data: imageDescription, isLoading: isAnalyzing } = useQuery({
    queryKey: ['/api/analyze-image', characterId],
    queryFn: async () => analyzeCharacterImage(getBase64Image())
  });

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      const story = await generateStory(
        character.name,
        imageDescription || "",
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
        character: character.id,
        characterImage: character.svg,
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
            <h2 className="text-2xl font-bold mb-4">Create Your Story with {character.name}</h2>
            <div className="mb-4" dangerouslySetInnerHTML={{ __html: character.svg }} />
            
            {imageDescription && (
              <p className="text-gray-600 italic mb-4">{imageDescription}</p>
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
              character={character}
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
