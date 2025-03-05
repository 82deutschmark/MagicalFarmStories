
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from "lucide-react";
import axios from "axios";

interface FarmImage {
  id: number;
  storyMakerId: string;
  imageBase64: string;
  originalFileName: string;
  description?: string;
  analyzedByAI: boolean;
  selectionCount: number;
  createdAt: string;
}

export default function ImageFetcher() {
  const [images, setImages] = useState<FarmImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/farm-images?count=3&orderBy=random");
      setImages(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch images. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleRerollImage = async (index: number) => {
    try {
      const response = await axios.get(`/api/farm-images?count=1&orderBy=random&excludeIds=${images.map(i => i.id).join(',')}`);
      if (response.data && response.data.length > 0) {
        const newImages = [...images];
        newImages[index] = response.data[0];
        setImages(newImages);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch a new image. Please try again.",
        variant: "destructive",
      });
      console.error("Error rerolling image:", error);
    }
  };

  const handleImageSelect = async (image: FarmImage) => {
    setAnalyzing(prev => ({ ...prev, [image.storyMakerId]: true }));
    try {
      // Navigate to the story-maker page with the storyMakerId
      setLocation(`/story-maker/${image.storyMakerId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select image. Please try again.",
        variant: "destructive",
      });
      console.error("Error selecting image:", error);
    } finally {
      setAnalyzing(prev => ({ ...prev, [image.storyMakerId]: false }));
    }
  };

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-3">
      {loading ? (
        // Loading skeletons
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square p-2">
              <Skeleton className="h-full w-full" />
            </div>
          </Card>
        ))
      ) : (
        // Actual images
        images.map((image, index) => (
          <Card key={image.storyMakerId} className="overflow-hidden relative">
            <div 
              className="aspect-square p-2 cursor-pointer" 
              onClick={() => !analyzing[image.storyMakerId] && handleImageSelect(image)}
            >
              <img
                src={`data:image/jpeg;base64,${image.imageBase64}`}
                alt={image.originalFileName || "Farm character"}
                className="h-full w-full object-cover rounded-md"
              />
              {analyzing[image.storyMakerId] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                  <span className="ml-2 text-white font-medium">Analyzing...</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2 p-2 h-8 w-8 rounded-full"
              onClick={() => handleRerollImage(index)}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Reroll image</span>
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
