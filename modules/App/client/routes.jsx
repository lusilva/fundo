import { Route, IndexRoute } from 'react-router';
import Paths from './paths';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';

export default (
    <Route path="/" component={Layout} onEnter={validate}>
        <IndexRoute component={Home}/>
        <Route path="/login" component={Login} onEnter={validate}/>
    </Route>
);


function validate(nextState, transition) {
    let isLoggedIn = !!Meteor.userId();

    let paths = isLoggedIn ? Paths.loggedIn : Paths.loggedOut;

    if (Meteor.isClient && Session)
        _.forEach(paths, function (value, index) {
            if (value.path == nextState.location.pathname) {
                Session.set('activePath', index)
            }
        });
}


