import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface FarmImage {
  id: number;
  storyMakerId: string;
  imageBase64: string;
  description?: string;
  analyzedByAI: boolean;
}

export default function Story() {
  const [match, params] = useRoute('/story/:characterId');
  const [loading, setLoading] = useState(true);
  const [character, setCharacter] = useState<FarmImage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCharacterData() {
      if (!params?.characterId) return;

      try {
        setLoading(true);
        const decodedId = decodeURIComponent(params.characterId);
        console.log("Fetching character data for ID:", decodedId);

        // First, try to analyze the image to get metadata and description
        const response = await axios.post('/api/analyze-image', {
          storyMakerId: decodedId
        });

        console.log("Received character data:", response.data);

        // Now fetch the full character data including the image
        const farmImagesResponse = await axios.get(`/api/farm-images?character=${decodedId}`);
        if (farmImagesResponse.data && farmImagesResponse.data.length > 0) {
          setCharacter({
            ...farmImagesResponse.data[0],
            description: response.data.description
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
      } finally {
        setLoading(false);
      }
    }

    fetchCharacterData();
  }, [params?.characterId]);

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
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-md" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-32 w-full" />
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