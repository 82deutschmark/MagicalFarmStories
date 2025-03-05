import React from 'react';
import { Router, Route, Switch } from 'wouter';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import Story from '@/pages/story';

export function RouterComponent() {
  // Add console logging for route matching
  const logRoute = (component: string, params: any) => {
    console.log(`RouterComponent - Rendering ${component}`, params);
    return null;
  };

  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route 
          path="/story/:characterId"
          component={(params) => {
            logRoute('Story', params);
            return <Story />;
          }}
        />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}