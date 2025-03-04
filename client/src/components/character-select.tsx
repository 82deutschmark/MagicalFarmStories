import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FarmImage } from "@shared/schema";

interface CharacterSelectProps {
  onProceed: (imagePath: string) => void;
}

export default function CharacterSelect({ onProceed }: CharacterSelectProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch images from database
  const { data: farmImages, refetch } = useQuery<FarmImage[]>({
    queryKey: ['/api/farm-images'],
    queryFn: async () => {
      const response = await apiRequest<FarmImage[]>("GET", "/api/farm-images");
      return response;
    },
  });

  // Get a random image from the available images
  const getRandomImage = () => {
    if (!farmImages || farmImages.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * farmImages.length);
    const randomImage = farmImages[randomIndex];
    setSelectedImage(randomImage.imageUrl);
  };

  // Get initial random image on component mount
  useEffect(() => {
    if (farmImages && farmImages.length > 0) {
      getRandomImage();
    }
  }, [farmImages]);

  return (
    <div className="flex flex-col items-center gap-6">
      {selectedImage && (
        <Card className="p-4 relative">
          <img
            src={selectedImage}
            alt="Farm Animal"
            className="w-64 h-64 object-cover rounded-lg"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={getRandomImage}
              title="Get another random image"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Button 
        onClick={() => selectedImage && onProceed(selectedImage)}
        disabled={!selectedImage}
        className="w-full max-w-xs"
      >
        Describe This Character
      </Button>
    </div>
  );
}