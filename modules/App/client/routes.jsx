import { Route, IndexRoute } from 'react-router';
import Paths from './paths';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default (
    <Route path="/" component={Layout}>
        <IndexRoute component={Home} onEnter={validate}/>
        <Route path="/login" component={Login} onEnter={validate}/>
        <Route path="/dashboard" component={Dashboard} onEnter={validateUser}/>
    </Route>
);


function validate(nextState, transition) {
    let isLoggedIn = !!Meteor.userId();
    if (isLoggedIn) {
        transition(null, '/dashboard');
        return;
    }

    let paths =  Paths.loggedOut;

    if (Meteor.isClient && Session)
        _.forEach(paths, function (value, index) {
            if (value.path == nextState.location.pathname) {
                Session.set('activePath', index)
            }
        });
}

function validateUser(nextState, transition) {
    let isLoggedIn = !!Meteor.userId();
    if (!isLoggedIn) {
        transition(null, '/');
        return;
    }

    let paths =  Paths.loggedIn;

    if (Meteor.isClient && Session)
        _.forEach(paths, function (value, index) {
            if (value.path == nextState.location.pathname) {
                Session.set('activePath', index)
            }
        });
}


