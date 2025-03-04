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
