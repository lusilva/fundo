import { Route, IndexRoute } from 'react-router';
import { userIsValid, getPathsForUser } from '../helpers';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default (
    <Route path="/" component={Layout}>
        <IndexRoute component={Home} onEnter={ensureUserNotLoggedIn}/>
        <Route path="/login" component={Login} onEnter={ensureUserNotLoggedIn}/>
        <Route path="/register" component={Register} onEnter={ensureUserNotValid}/>
        <Route path="/dashboard" component={Dashboard} onEnter={ensureUserValid}/>
    </Route>
);


function ensureUserNotLoggedIn(nextState, transition) {

    let redirectURL = userIsValid() ? '/dashboard' : '/register';

    validationHelper(
        nextState,
        transition,
        redirectURL,
        !!Meteor.userId());
}

function ensureUserNotValid(nextState, transition) {

    let userValid = userIsValid();
    validationHelper(
        nextState,
        transition,
        '/dashboard',
        userValid);
}


function ensureUserValid(nextState, transition) {

    let userNotValid = !userIsValid();

    validationHelper(
        nextState,
        transition,
        '/',
        userNotValid);
}


function validationHelper(nextState, transitionFunc, transitionURL, criteria) {
    if (criteria) {
        transitionFunc(null, transitionURL);
        return;
    }
    if (Meteor.isClient && Session)
        _.forEach(getPathsForUser(), function (value, index) {
            if (value.path == nextState.location.pathname) {
                Session.set('activePath', index)
            }
        });
}
