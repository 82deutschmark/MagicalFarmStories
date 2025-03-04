import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CHARACTERS } from "@shared/schema";

interface CharacterSelectProps {
  characters: typeof CHARACTERS;
  selectedCharacter: string | null;
  onSelect: (id: string) => void;
}

export default function CharacterSelect({
  characters,
  selectedCharacter,
  onSelect
}: CharacterSelectProps) {
  return (
    <>
      {characters.map((character) => (
        <Card
          key={character.id}
          className={`cursor-pointer transition-all duration-200 ${
            selectedCharacter === character.id
              ? "ring-2 ring-primary"
              : "hover:shadow-lg"
          }`}
          onClick={() => onSelect(character.id)}
        >
          <CardContent className="p-4">
            <div
              className="w-full aspect-square mb-4"
              dangerouslySetInnerHTML={{ __html: character.svg }}
            />
            <h3 className="text-xl font-semibold text-center">{character.name}</h3>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
import { useState, useEffect } from "react";
import { FARM_IMAGES } from "@shared/schema";
import Image from "next/image";

interface CharacterSelectProps {
  selectedCharacter: string | null;
  onSelect: (imagePath: string) => void;
}

export default function CharacterSelect({ 
  selectedCharacter, 
  onSelect 
}: CharacterSelectProps) {
  const [randomImages, setRandomImages] = useState<string[]>([]);
  
  // Select 3 random images when component mounts
  useEffect(() => {
    const shuffled = [...FARM_IMAGES].sort(() => 0.5 - Math.random());
    setRandomImages(shuffled.slice(0, 3));
  }, []);

  return (
    <>
      {randomImages.map((imagePath, index) => (
        <div 
          key={index}
          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
            selectedCharacter === imagePath ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
          }`}
          onClick={() => onSelect(imagePath)}
        >
          <img
            src={imagePath}
            alt={`Farm friend ${index + 1}`}
            className="w-full h-auto aspect-square object-cover"
          />
        </div>
      ))}
    </>
  );
}
