import { Router, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Story from "@/pages/story";
import Debug from "@/pages/debug";
import NotFound from "@/pages/not-found";

function RouterComponent() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/story/tune/:characterId" component={Story} />
      <Route path="/debug" component={Debug} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;