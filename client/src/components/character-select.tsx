import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CharacterSelectProps {
  imagePath: string;
  onSelect: () => void;
}

export function CharacterSelect({ imagePath, onSelect }: CharacterSelectProps) {
  const [_, setLocation] = useLocation();

  const handleSelect = () => {
    // Navigate to the story page with the encoded image path
    const encodedPath = encodeURIComponent(imagePath);
    setLocation(`/story/${encodedPath}`);
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