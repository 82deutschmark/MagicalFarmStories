import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StoryDisplayProps {
  characterImage: string;
  story: string;
  illustration: string | null;
  onGenerateIllustration: () => void;
  onSaveStory: () => void;
  isGeneratingIllustration: boolean;
  isSaving: boolean;
}

export default function StoryDisplay({
  characterImage,
  story,
  illustration,
  onGenerateIllustration,
  onSaveStory,
  isGeneratingIllustration,
  isSaving
}: StoryDisplayProps) {
  return (
    <Card className="bg-white/90">
      <CardContent className="p-6">
        <div className="prose max-w-none mb-6">
          <h2 className="text-2xl font-bold mb-4">
            A Magical Farm Adventure
          </h2>

          <div className="whitespace-pre-wrap">{story}</div>
        </div>

        {illustration && (
          <div className="mb-6">
            <img
              src={illustration}
              alt="Story Illustration"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="flex gap-4 justify-end">
          {!illustration && (
            <Button
              onClick={onGenerateIllustration}
              disabled={isGeneratingIllustration}
            >
              {isGeneratingIllustration
                ? "Creating Illustration..."
                : "Generate Illustration"}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onSaveStory}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Story"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}