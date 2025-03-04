import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CharacterSelectProps {
  onProceed: (imageId: string) => void;
}

export function CharacterSelect({ onProceed }: CharacterSelectProps) {
  const navigate = useNavigate();

  const handleGoToDebug = () => {
    navigate("/debug");
  };

  return (
    <div className="mt-6 text-center">
      <p className="text-gray-600 mb-4">
        Select a character above to create a farm story with them!
      </p>
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleGoToDebug} 
          variant="outline"
        >
          Go to Debug Page
        </Button>
      </div>
    </div>
  );
}