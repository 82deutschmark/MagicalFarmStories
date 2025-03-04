
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CharacterSelect } from "@/components/character-select";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/queryClient";

export default function Home() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: images, isLoading, error } = useQuery({
    queryKey: ["farmImages"],
    queryFn: () => getJson<any[]>("/api/farm-images")
  });

  useEffect(() => {
    console.log("Home component rendered");
  }, []);

  const handleProceed = (imageId: string) => {
    setSelectedImage(imageId);
    navigate(`/story-maker/${imageId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="max-w-3xl w-full p-6">
        <Card className="bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Choose Your Farm Friend!
            </h2>

            {isLoading ? (
              <div className="text-center">Loading farm friends...</div>
            ) : error ? (
              <div className="text-center text-red-500">
                Error loading images. Please try again.
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {images.slice(0, 3).map((img, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative group">
                      <img
                        src={`data:image/jpeg;base64,${img.imageBase64}`}
                        alt={`Farm Friend ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-amber-500 transition-all"
                        onClick={() => handleProceed(img.storyMakerId)}
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg"
                        onClick={() => handleProceed(img.storyMakerId)}
                      >
                        <span className="text-white opacity-0 group-hover:opacity-100 font-bold">
                          Select
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-sm">{img.description ? img.description.substring(0, 60) + '...' : 'Click to select this friend!'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-amber-800 p-4 bg-amber-50 rounded-lg">
                No farm friends found. Please add some images through the debug page.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
