import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FarmImage } from "@shared/schema";
import { RefreshCw } from "lucide-react";

interface CharacterSelectProps {
  onProceed: (imagePath: string) => void;
}

export default function CharacterSelect({ onProceed }: CharacterSelectProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch random images from database
  const { data: farmImages = [], isLoading } = useQuery<FarmImage[]>({
    queryKey: ['/api/farm-images'],
    queryFn: async () => {
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      console.log("Fetched images:", response); // Debug log
      // Ensure we're returning an array
      return Array.isArray(response) ? response : [];
    }
  });
  
  // Function to reroll a single character
  const rerollCharacter = async (index: number) => {
    try {
      // Fetch a single random image
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      if (Array.isArray(response) && response.length > 0) {
        // Create a new array with the replaced image
        const newImages = [...farmImages];
        newImages[index] = response[0];
        
        // Update the cache with the new array
        queryClient.setQueryData(['/api/farm-images'], newImages);
      }
    } catch (error) {
      console.error("Error rerolling character:", error);
    }
  };

  if (isLoading) {
    return <div>Loading farm friends...</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {farmImages.map((image, index) => (
          <Card 
            key={image.id || index}
            className={`cursor-pointer transition-all duration-200 p-4 ${
              selectedImage === image.storyMakerId ? 'ring-2 ring-primary' : 'hover:shadow-lg'
            }`}
          >
            <div className="relative">
              <img
                src={`data:image/jpeg;base64,${image.imageBase64}`}
                alt={image.description || "Farm Animal"}
                className="w-full aspect-square object-cover rounded-lg"
                onClick={() => setSelectedImage(image.storyMakerId)}
              />
              <Button 
                size="icon"
                variant="outline"
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  rerollCharacter(index);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end items-center">
        <Button 
          onClick={() => selectedImage && onProceed(selectedImage)}
          disabled={!selectedImage}
        >
          Describe This Character
        </Button>
      </div>
    </div>
  );
}