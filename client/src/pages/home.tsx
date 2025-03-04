import React from 'react';
import { useLocation } from 'wouter';
import ImageFetcher from '../components/ImageFetcher';

const Home: React.FC = () => {
  const [location, navigate] = useLocation();

  const goToDebug = () => {
    navigate('/debug');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Uncle Mark's Magical Farm</h1>
        <p className="text-lg text-gray-600">Choose a character to start your story adventure!</p>
      </header>

      <div className="mb-8">
        <ImageFetcher />
      </div>

      <div className="text-center mt-8">
        <button 
          onClick={goToDebug}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go to Debug Page
        </button>
      </div>
    </div>
  );
};

export default Home;