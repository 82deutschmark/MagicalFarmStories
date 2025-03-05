import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { LoadingAnimation } from '@/components/ui/loading-animation'; // Added import


interface FarmImage {
  id: number;
  storyMakerId: string;
  imageBase64: string;
  description?: string;
  analyzedByAI: boolean;
}

export default function Story() {
  const [match, params] = useRoute('/story/:id');
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<FarmImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCharacterData() {
      if (!params?.id) return;

      try {
        setLoading(true);
        const characterId = parseInt(params.id);
        console.log("Fetching character data for ID:", characterId);

        // Directly fetch the farm image by its numeric ID
        const response = await axios.get(`/api/farm-images/${characterId}`);
        const farmImage = response.data;

        if (!farmImage || !farmImage.imageBase64) {
          throw new Error("Could not find image data for the selected character");
        }

        // Then analyze the image to get metadata and description
        const analysisResponse = await axios.post('/api/analyze-image', {
          id: characterId,
          imageBase64: farmImage.imageBase64
        });

        console.log("Received character data:", analysisResponse.data);

        // Now fetch the full character data including the image
        const farmImagesResponse = await axios.get(`/api/farm-images?character=${characterId}`); 
        if (farmImagesResponse.data && farmImagesResponse.data.length > 0) {
          setCharacter({
            ...farmImagesResponse.data[0],
            description: analysisResponse.data.description 
          });
        } else {
          toast({
            title: "Error",
            description: "Character not found. Please try another character.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching character:", error);
        toast({
          title: "Error",
          description: "Failed to load character information. Please try again.",
          variant: "destructive",
        });
        setCharacter(null); 
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchCharacterData();
    } else {
      setLoading(false);
    }
  }, [params?.id, toast]);

  if (!match) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-gray-900">Character Not Found</h1>
            <p className="mt-4 text-sm text-gray-600">
              The character you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center">
                <Card className="p-8 bg-white/90">
                  <LoadingAnimation 
                    message="Getting to know your new farm friend" 
                    variant="large" 
                  />
                  <p className="mt-4 text-muted-foreground">
                    Our magical storyteller is learning all about your character...
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="col-span-1 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-20 bg-muted rounded"></div>
                    </div>
                    <div className="col-span-2 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : character ? (
              <div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-1/3">
                    <img 
                      src={`data:image/jpeg;base64,${character.imageBase64}`}
                      alt="Character"
                      className="w-full rounded-md shadow-md"
                    />
                  </div>
                  <div className="w-full md:w-2/3">
                    <h1 className="text-2xl font-bold mb-4">Your Farm Character</h1>
                    <p className="text-gray-700">{character.description}</p>
                  </div>
                </div>

                {/* Story generation form would go here */}
              </div>
            ) : (
              <div className="text-center">
                <p>Could not find character information. Please go back and select another character.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// We're now using the imported LoadingAnimation component from ui/loading-animation.tsx