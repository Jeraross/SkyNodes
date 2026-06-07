import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Switch } from 'wouter';
import './index.css';
import App from './App.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import LoginPage       from './pages/LoginPage.tsx';
import GamePage        from './pages/GamePage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Switch>
        <Route path="/game"        component={GamePage}        />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/login"       component={LoginPage}       />
        <Route component={App} />
      </Switch>
    </Router>
  </StrictMode>,
);
