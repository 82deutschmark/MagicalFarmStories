
import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeCharacterImage, generateIllustration } from '@/lib/openai';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getJson, postJson } from '@/lib/queryClient';
import StoryDisplay from '@/components/story-display';

export default function StoryMaker() {
  const { id } = useParams<{ id?: string }>();
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [storyText, setStoryText] = useState<string | null>(null);
  const [illustration, setIllustration] = useState<string | null>(null);

  // Fetch the character image
  const { data: characterData, isLoading } = useQuery({
    queryKey: ['characterImage', id],
    queryFn: () => id ? getJson<any>(`/api/farm-image/${id}`) : null,
    enabled: !!id
  });

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      if (!characterData) return null;
      const description = await analyzeCharacterImage(
        characterData.imageBase64,
        id as string
      );
      return postJson<{ story: string }>('/api/generate-story', {
        characterId: id,
        description: description,
        additionalPrompt: additionalPrompt
      });
    },
    onSuccess: (data) => {
      if (data) {
        setStoryText(data.story);
      }
    }
  });

  const generateIllustrationMutation = useMutation({
    mutationFn: async () => {
      if (!storyText) return null;
      const imageUrl = await generateIllustration(storyText);
      return imageUrl;
    },
    onSuccess: (imageUrl) => {
      if (imageUrl) {
        setIllustration(imageUrl);
      }
    }
  });

  const saveStoryMutation = useMutation({
    mutationFn: () => {
      if (!storyText) return Promise.resolve(null);
      return postJson('/api/save-story', {
        characterId: id,
        story: storyText,
        illustration: illustration
      });
    }
  });

  const imagePath = characterData ? `data:image/jpeg;base64,${characterData.imageBase64}` : '';

  if (isLoading) {
    return <div className="text-center p-8">Loading character...</div>;
  }

  if (!characterData && id) {
    return <div className="text-center p-8">Character not found</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="max-w-4xl w-full">
        <Card className="bg-white/90 shadow-lg">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Create Your Farm Story</h1>
            
            {characterData && (
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/3">
                  <img 
                    src={imagePath}
                    alt="Character" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                
                <div className="w-full md:w-2/3">
                  <h2 className="text-xl font-semibold mb-2">Adventure with your Farm Friend</h2>
                  <p className="mb-4">
                    Add any special details for your story below, then click "Generate Story" to create a unique adventure!
                  </p>
                  
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
              </div>
            )}

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
