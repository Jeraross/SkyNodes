import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Switch } from 'wouter';
import './index.css';
import App from './App.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import LoginPage       from './pages/LoginPage.tsx';
import GamePage        from './pages/GamePage.tsx';
import ProjetoPage     from './pages/ProjetoPage.tsx';
import GrafosPage      from './pages/GrafosPage.tsx';
import DadosPage       from './pages/DadosPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Switch>
        <Route path="/game"        component={GamePage}        />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/login"       component={LoginPage}       />
        <Route path="/projeto"     component={ProjetoPage}     />
        <Route path="/grafos"      component={GrafosPage}      />
        <Route path="/dados"       component={DadosPage}       />
        <Route component={App} />
      </Switch>
    </Router>
  </StrictMode>,
);
