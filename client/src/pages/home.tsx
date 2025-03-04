import { useState } from "react";
import { useLocation } from "wouter";
import CharacterSelect from "@/components/character-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHARACTERS } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleStartStory = () => {
    if (selectedCharacter) {
      setLocation(`/story/${selectedCharacter}`);
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
                characters={CHARACTERS}
                selectedCharacter={selectedCharacter}
                onSelect={setSelectedCharacter}
              />
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                disabled={!selectedCharacter}
                onClick={handleStartStory}
              >
                Start Your Magical Story!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
