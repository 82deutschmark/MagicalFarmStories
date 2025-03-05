import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { RouterComponent } from '@/components/RouterComponent';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent />
      <Toaster />
    </QueryClientProvider>
  );
}