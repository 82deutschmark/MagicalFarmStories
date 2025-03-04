import { useState } from "react";
import { useLocation } from "wouter";
import CharacterSelect from "@/components/character-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleProceed = (imagePath: string) => {
    if (imagePath) {
      // Encode the image path in the URL
      setLocation(`/story/${encodeURIComponent(imagePath)}`);
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

            <CharacterSelect onProceed={handleProceed} />

          </CardContent>
        </Card>
      </div>
    </div>
  );
}