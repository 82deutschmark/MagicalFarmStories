
import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const [characterName, setCharacterName] = React.useState("");
  const [characterDescription, setCharacterDescription] = React.useState("");

  const handleStartStory = () => {
    if (characterName && characterDescription) {
      navigate(`/story?name=${encodeURIComponent(characterName)}&description=${encodeURIComponent(characterDescription)}`);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">AI Story Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Character</CardTitle>
          <CardDescription>
            Enter details about your character to generate a personalized story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Character Name
            </label>
            <Input
              id="name"
              placeholder="e.g., Luna the Brave Lion"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Character Description
            </label>
            <Input
              id="description"
              placeholder="e.g., A young lion cub who loves adventures"
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartStory}
            disabled={!characterName || !characterDescription}
            className="w-full"
          >
            Create Story
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;
