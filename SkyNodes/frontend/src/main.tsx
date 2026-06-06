import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router, Route, Switch } from 'wouter';
import './index.css';
import App from './App.tsx';
import { QuizGameProvider } from './router/QuizGameContext.tsx';
import QuizModeSelect  from './pages/QuizModeSelect.tsx';
import QuizPathMap     from './pages/QuizPathMap.tsx';
import QuizNodeSession from './pages/QuizNodeSession.tsx';
import QuizBoss        from './pages/QuizBoss.tsx';
import QuizResult      from './pages/QuizResult.tsx';
import AlbumPage       from './pages/AlbumPage.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import LoginPage       from './pages/LoginPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <QuizGameProvider>
        <Switch>
          <Route path="/quiz"                    component={QuizModeSelect}  />
          <Route path="/quiz/map/:mode"          component={QuizPathMap}     />
          <Route path="/quiz/node/:mode/:nodeId" component={QuizNodeSession} />
          <Route path="/quiz/boss/:mode/:bossId"  component={QuizBoss}        />
          <Route path="/quiz/result/:mode"       component={QuizResult}      />
          <Route path="/album"                   component={AlbumPage}       />
          <Route path="/leaderboard"             component={LeaderboardPage} />
          <Route path="/login"                   component={LoginPage}       />
          <Route component={App} />
        </Switch>
      </QuizGameProvider>
    </Router>
  </StrictMode>,
);
