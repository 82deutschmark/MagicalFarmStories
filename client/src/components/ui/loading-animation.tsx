
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingAnimationProps {
  message?: string;
  variant?: "default" | "large";
}

export function LoadingAnimation({ message = "Loading...", variant = "default" }: LoadingAnimationProps) {
  const [dots, setDots] = useState("");
  const [animalEmoji, setAnimalEmoji] = useState("🐄");
  
  // Farm animal emojis
  const farmAnimals = ["🐄", "🐑", "🐓", "🐖", "🐎", "🐇", "🦆", "🐐"];
  
  useEffect(() => {
    // Dot animation
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    
    // Animal rotation
    const animalInterval = setInterval(() => {
      setAnimalEmoji(prev => {
        const currentIndex = farmAnimals.indexOf(prev);
        const nextIndex = (currentIndex + 1) % farmAnimals.length;
        return farmAnimals[nextIndex];
      });
    }, 1000);
    
    return () => {
      clearInterval(dotInterval);
      clearInterval(animalInterval);
    };
  }, []);
  
  return (
    <div className={`flex flex-col items-center justify-center ${variant === "large" ? "py-12" : "py-4"}`}>
      <div className={`animate-bounce ${variant === "large" ? "text-5xl" : "text-3xl"} mb-4`}>
        {animalEmoji}
      </div>
      
      <div className="flex items-center">
        <Loader2 className={`mr-2 animate-spin ${variant === "large" ? "h-8 w-8" : "h-4 w-4"}`} />
        <p className={`font-medium ${variant === "large" ? "text-xl" : "text-base"}`}>
          {message}{dots}
        </p>
      </div>
      
      {variant === "large" && (
        <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress"></div>
        </div>
      )}
    </div>
  );
}
      </div>
    </div>
  );
}
