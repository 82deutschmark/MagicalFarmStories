
import { useState } from "react";
import { useLocation } from "wouter";
import CharacterSelect from "@/components/character-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleStartStory = () => {
    if (selectedCharacter) {
      // Encode the image path in the URL, we'll use the actual path to load and encode the image
      setLocation(`/story/${encodeURIComponent(selectedCharacter)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
          Uncle Mark's Magical Farm
        </h1>
        
        <Card className="bg-white/80 backdrop-blur">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Choose Your Farm Friend!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <CharacterSelect
                selectedCharacter={selectedCharacter}
                onSelect={setSelectedCharacter}
              />
            </div>
            
            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 text-lg"
                onClick={handleStartStory}
                disabled={!selectedCharacter}
              >
                Start Your Adventure!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
