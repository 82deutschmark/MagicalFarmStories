import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CharacterSelectProps {
  imagePath: string;
  storyMakerId: string;
  onSelect: () => void;
}

export function CharacterSelect({ imagePath, storyMakerId, id, onSelect }: CharacterSelectProps & { id: number }) {
  const [_, setLocation] = useLocation();

  const handleSelect = () => {
    console.log('Character Select - Selected character:', {
      imagePath,
      id,
      storyMakerId
    });

    // Navigate to the story page with the numeric id
    setLocation(`/story/${id}`);
    onSelect();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square">
        <img 
          src={imagePath} 
          alt="Farm Character" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <Button 
          onClick={handleSelect}
          className="w-full"
        >
          Select Character
        </Button>
      </div>
    </Card>
  );
}