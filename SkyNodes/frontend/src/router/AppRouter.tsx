import { Route, Switch } from 'wouter';
import QuizModeSelect  from '../pages/QuizModeSelect';
import QuizPathMap     from '../pages/QuizPathMap';
import QuizNodeSession from '../pages/QuizNodeSession';
import QuizBoss        from '../pages/QuizBoss';
import QuizResult      from '../pages/QuizResult';
import AlbumPage       from '../pages/AlbumPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import LoginPage       from '../pages/LoginPage';

export default function AppRouter() {
  return (
    <Switch>
      <Route path="/quiz"                    component={QuizModeSelect}  />
      <Route path="/quiz/map/:mode"          component={QuizPathMap}     />
      <Route path="/quiz/node/:mode/:nodeId" component={QuizNodeSession} />
      <Route path="/quiz/boss/:mode"         component={QuizBoss}        />
      <Route path="/quiz/result/:mode"       component={QuizResult}      />
      <Route path="/album"                   component={AlbumPage}       />
      <Route path="/leaderboard"             component={LeaderboardPage} />
      <Route path="/login"                   component={LoginPage}       />
    </Switch>
  );
}
