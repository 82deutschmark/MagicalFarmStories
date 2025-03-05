
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageFetcher from '@/components/ImageFetcher';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Uncle Mark's Magical Farm</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Welcome to a world of imagination! Select a farm character to begin your storytelling adventure.
                Each character has their own unique personality and stories to tell.
              </p>
            </div>
            
            <ImageFetcher />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Select a character to start your adventure!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
