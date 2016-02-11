import { Route, IndexRoute } from 'react-router';
import { userIsValid, getPathsForUser } from '../helpers';
import Logger from 'App/logger';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default (
    <Route component={Layout}>
        <Route path="/" component={Home}/>
        <Route path="/login" component={Login} onEnter={ensureUserNotLoggedIn}/>
        <Route path="/register" component={Register} onEnter={ensureUserNotValid}/>
        <Route path="/dashboard" component={Dashboard} onEnter={ensureUserValid}/>
    </Route>
);

function ensureUserNotLoggedIn(nextState, transitionFunc) {
    let redirectURL = userIsValid() ? '/dashboard' : '/register';

    Logger.debug('[ensureUserNotLoggedIn] user %s', userIsValid() ? 'valid' : 'not valid');

    validationHelper(
        nextState,
        transitionFunc,
        redirectURL,
        !!Meteor.userId());
}

function ensureUserNotValid(nextState, transitionFunc) {

    let userValid = userIsValid();
    validationHelper(
        nextState,
        transitionFunc,
        '/dashboard',
        userValid);
}


function ensureUserValid(nextState, transitionFunc) {

    let userNotValid = !userIsValid();

    Logger.debug('[ensureUserValid] user %s', !userNotValid ? 'valid' : 'not valid');


    validationHelper(
        nextState,
        transitionFunc,
        '/',
        userNotValid);
}


function validationHelper(nextState, transitionFunc, transitionURL, criteria) {
    if (criteria && transitionURL !== nextState.location.pathname) {
        Logger.debug('Redirecting to %s', transitionURL);
        transitionFunc(null, transitionURL);
    }
}
