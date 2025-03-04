import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Home from '@/pages/home';
import Debug from '@/pages/debug';
import StoryMaker from './pages/storymaker';
import Story from "@/pages/story";
import NotFound from "@/pages/not-found";
import './App.css';

// Create a client
const queryClient = new QueryClient();

function RouterComponent({ children }: { children: React.ReactNode }) {
  return (
    <Router>{children}</Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/debug" component={Debug} />
          <Route path="/storymaker/:id?" component={StoryMaker} />
          <Route path="/story/tune/:characterId" component={Story} />
          <Route path="*" component={NotFound} />
        </Switch>
      </RouterComponent>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;