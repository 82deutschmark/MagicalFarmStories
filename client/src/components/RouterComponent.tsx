
import React from 'react';
import { Router, Route, Switch } from 'wouter';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import StoryMaker from '@/pages/story-maker';

export function RouterComponent() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/story-maker/:id" component={StoryMaker} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}
