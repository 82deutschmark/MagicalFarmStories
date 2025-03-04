import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FarmImage } from "@shared/schema";

interface CharacterSelectProps {
  onProceed: (imagePath: string) => void;
}

export default function CharacterSelect({ onProceed }: CharacterSelectProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch random images from database
  const { data: farmImages = [], isLoading, refetch } = useQuery<FarmImage[]>({
    queryKey: ['/api/farm-images'],
    queryFn: async () => {
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      console.log("Fetched images:", response); // Debug log
      return response;
    }
  });

  if (isLoading) {
    return <div>Loading farm friends...</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {farmImages.map((image) => (
          <Card 
            key={image.id}
            className={`cursor-pointer transition-all duration-200 p-4 ${
              selectedImage === image.imageUrl ? 'ring-2 ring-primary' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedImage(image.imageUrl)}
          >
            <img
              src={image.imageUrl}
              alt="Farm Animal"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline"
          onClick={() => refetch()}
        >
          Show Different Animals
        </Button>

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