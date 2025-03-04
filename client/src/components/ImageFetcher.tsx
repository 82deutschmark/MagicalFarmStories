
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface FarmImage {
  id: number;
  storyMakerId: string;
  imageBase64: string;
  originalFileName: string;
  description?: string;
  analyzedByAI: boolean;
  selectionCount: number;
  createdAt: string;
}

export const fetchFarmImages = async (count = 3) => {
  try {
    console.log('Fetching farm images...');
    const response = await axios.get(`/api/farm-images?count=${count}`);
    console.log('Farm images response:', response.data);
    return response.data as FarmImage[];
  } catch (error) {
    console.error('Error fetching farm images:', error);
    throw error;
  }
};

const ImageFetcher: React.FC = () => {
  const { data: images, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['farmImages'],
    queryFn: () => fetchFarmImages(),
  });

  if (isLoading) {
    return <div className="text-center my-8">Loading images...</div>;
  }

  if (isError) {
    console.error('Error fetching images:', error);
    return (
      <div className="text-center my-8">
        <p className="text-red-500">Error loading images</p>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center my-8">
        <p>No images available. Please make sure to upload some images in the debug page.</p>
        <a 
          href="/debug" 
          className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded"
        >
          Go to Debug Page
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="bg-white p-4 rounded shadow">
          <div className="aspect-w-1 aspect-h-1 mb-4">
            <img
              src={`data:image/jpeg;base64,${image.imageBase64}`}
              alt={image.originalFileName || 'Farm character'}
              className="object-cover w-full h-full rounded"
            />
          </div>
          <div className="text-sm text-gray-600">
            {image.originalFileName && <p>Filename: {image.originalFileName}</p>}
            <p>ID: {image.storyMakerId.substring(0, 8)}...</p>
            <p>Selected: {image.selectionCount} times</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageFetcher;
