import React from 'react';
import { Router, Route, Switch } from 'wouter';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import Story from '@/pages/story';

export function RouterComponent() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story/:characterId" component={Story} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}