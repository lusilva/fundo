import { Route, IndexRoute, browserHistory } from 'react-router';
import { getPathsForUser, pathIsValidForUser } from '../helpers';
import Logger from 'App/logger';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default (
    <Route component={Layout} history={browserHistory}>
        <Route path="/" component={Home}/>
        <Route path="/login" component={Login} onEnter={validateUser}/>
        <Route path="/dashboard" component={Dashboard} onEnter={validateUser}/>
        <Route path="/logout" onEnter={logoutUser}/>
    </Route>
);

function validateUser(nextState, transitionFunc) {
    if (!pathIsValidForUser(nextState.location.pathname)) {
        let transitionURL = getPathsForUser()[0].path;
        Logger.debug('Redirecting to %s', transitionURL);
        transitionFunc(transitionURL);
    }
}

function logoutUser(nextState, transitionFunc, done) {
    Meteor.logout(function (err) {
        if (!err) {
            transitionFunc('/login');
        }
        done();
    });
}
