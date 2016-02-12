import { Route, IndexRoute } from 'react-router';
import { userIsValid, getPathsForUser, pathIsValidForUser } from '../helpers';
import Logger from 'App/logger';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default (
    <Route component={Layout}>
        <Route path="/" component={Home} onEnter={validateUser}/>
        <Route path="/login" component={Login} onEnter={validateUser}/>
        <Route path="/register" component={Register} onEnter={validateUser}/>
        <Route path="/dashboard" component={Dashboard} onEnter={validateUser}/>
    </Route>
);

function validateUser(nextState, transitionFunc) {
    if (!pathIsValidForUser(nextState.location.pathname)) {
        let transitionURL = getPathsForUser()[0].path;
        Logger.debug('Redirecting to %s', transitionURL, nextState);
        transitionFunc(null, transitionURL);
    }
}
