import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Story from "@/pages/story";
import Debug from "@/pages/debug"; // Added import for Debug page
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/story/tune/:characterId" element={<Story />} />
      <Route path="/debug" element={<Debug />} /> {/* Added debug route */}
      <Route path="*" element={<NotFound />} /> {/* Added a catch-all route for 404 */}
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;