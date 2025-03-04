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
  const [rerollStates, setRerollStates] = useState([false, false, false]); // Added state for reroll loading
  const queryClient = useQueryClient();

  // Fetch random images from database
  const { data: farmImages = [], isLoading } = useQuery<FarmImage[]>({
    queryKey: ['/api/farm-images'],
    queryFn: async () => {
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      console.log("Fetched images:", response); // Debug log
      
      // Add more detailed logging
      if (Array.isArray(response)) {
        console.log(`Retrieved ${response.length} images`);
        response.forEach((img, i) => {
          console.log(`Image ${i+1}:`, {
            id: img.id,
            storyMakerId: img.storyMakerId,
            hasImageData: !!img.imageBase64,
            imageDataLength: img.imageBase64 ? img.imageBase64.length : 0
          });
        });
      } else {
        console.error("Response is not an array:", response);
      }
      
      // Ensure we're returning an array
      return Array.isArray(response) ? response : [];
    }
  });

  // Function to reroll a single character
  const rerollCharacter = async (index: number) => {
    try {
      setRerollStates(prevState => {
        const newState = [...prevState];
        newState[index] = true;
        return newState;
      });
      // Fetch a single random image
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      if (Array.isArray(response) && response.length > 0) {
        // Create a new array with the replaced image
        const newImages = [...farmImages];
        newImages[index] = response[0];

        // Update the cache with the new array
        queryClient.setQueryData(['/api/farm-images'], newImages);
        setRerollStates(prevState => {
          const newState = [...prevState];
          newState[index] = false;
          return newState;
        });
      }
    } catch (error) {
      console.error("Error rerolling character:", error);
      setRerollStates(prevState => {
        const newState = [...prevState];
        newState[index] = false;
        return newState;
      });
    }
  };

  if (isLoading) {
    return <div>Loading farm friends...</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {farmImages.slice(0, 3).map((image, index) => (
          <div 
            key={image.storyMakerId || index} 
            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all transform hover:shadow-xl ${
              selectedImage === image.storyMakerId ? 'border-blue-500 scale-105 shadow-lg' : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedImage(image.storyMakerId)} // Decoupled setSelectedImage
          >
            <div className="absolute top-2 right-2 z-10">
              <button 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  rerollCharacter(index);
                }}
                disabled={rerollStates[index]}
                aria-label="Get a different character"
              >
                {rerollStates[index] ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>

            {image.imageBase64 ? (
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={`data:image/jpeg;base64,${image.imageBase64}`} 
                  alt={`Farm character ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Error loading image ${index}`, e);
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="24" text-anchor="middle" fill="%23999">Image Error</text></svg>';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span>No image available</span>
              </div>
            )}

            <div className="p-4 bg-white">
              <h3 className="text-lg font-medium">Farm Friend #{index + 1}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {image.selectionCount > 0 ? `Selected ${image.selectionCount} time${image.selectionCount !== 1 ? 's' : ''}` : 'New friend!'}
              </p>
            </div>
          </div>
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