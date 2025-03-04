
import React from 'react';
import { Router } from 'wouter';

type RouterComponentProps = {
  children: React.ReactNode;
};

const RouterComponent: React.FC<RouterComponentProps> = ({ children }) => {
  return (
    <Router>{children}</Router>
  );
};

export default RouterComponent;
