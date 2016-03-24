import { Route, IndexRoute, browserHistory } from 'react-router';
import { getPathsForUser, pathIsValidForUser } from '../helpers';
import Logger from 'App/logger';
import PreferenceSet from 'App/collections/PreferenceSet';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MyEvents from './components/MyEvents';
import Welcome from './components/WelcomePage';

import $script from 'scriptjs';

export default (
    <Route component={Layout} history={browserHistory} onEnter={getGoogleMaps}>
        <Route path="/" component={Home}/>
        <Route path="/login" component={Login} onEnter={validateNotUser}/>
        <Route path="/welcome" component={Welcome} onEnter={validateWelcome}/>
        <Route path="/dashboard" component={Dashboard} onEnter={validateUser}/>
        <Route path="/myevents" component={MyEvents} onEnter={validateUser}/>
        <Route path="/logout" onEnter={logoutUser}/>
    </Route>
);


function getGoogleMaps(nextState, transitionFunc, done) {
    $script("//maps.googleapis.com/maps/api/js?libraries=places", function () {
        done();
    });
}


function validateWelcome(nextState, transitionFunc, done) {

    let loggedIn = false;
    if (Meteor.isClient) {
        loggedIn = !!Meteor.userId() || Meteor.loggingIn();
    } else {
        loggedIn = !!Meteor.userId();
    }

    if (!loggedIn) {
        transitionFunc(getPathsForUser()[0].path);
        done();
        return;
    }

    // Get all necessary subscriptions
    Meteor.subscribe('userpreferences', {
        onReady: function () {
            // Find the preference set for the current user.
            let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

            if (!Meteor.userId() || preferences.location) {
                transitionFunc(getPathsForUser()[0].path);
            }

            done();
        }
    });
}


function validateNotUser(nextState, transitionFunc, done) {
    let loggedIn = false;
    if (Meteor.isClient) {
        loggedIn = !!Meteor.userId() || Meteor.loggingIn();
    } else {
        loggedIn = !!Meteor.userId();
    }

    if (loggedIn) {
        transitionFunc(getPathsForUser()[0].path);
    }

    done();
}


function validateUser(nextState, transitionFunc, done) {
    let loggedIn = false;
    if (Meteor.isClient) {
        loggedIn = !!Meteor.userId() || Meteor.loggingIn();
    } else {
        loggedIn = !!Meteor.userId();
    }

    if (!loggedIn) {
        transitionFunc(getPathsForUser()[0].path);
        done();
    } else {
        // Get all necessary subscriptions
        Meteor.subscribe('userpreferences', {
            onReady: function () {
                // Find the preference set for the current user.
                let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

                if (!preferences || !preferences.location) {
                    transitionFunc('/welcome');
                }

                done();
            }
        });
    }


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
