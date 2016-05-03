import { Route, IndexRoute, browserHistory } from 'react-router';
import { getPathsForUser, pathIsValidForUser } from '../helpers';
import Logger from 'imports/logger';
import PreferenceSet from 'imports/collections/PreferenceSet';

import Layout from './layout/Layout';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import MyEvents from './components/pages/MyEvents';
import Welcome from './components/pages/Welcome';
import AccountSettings from './components/pages/AccountSettings';

export default (
  <Route component={Layout} history={browserHistory}>
    <Route path="/" component={Home} onEnter={validateNotUser}/>
    <Route path="/login" component={Login} onEnter={validateNotUser}/>
    <Route path="/welcome" component={Welcome} onEnter={validateWelcome}/>
    <Route path="/dashboard" component={Dashboard} onEnter={validateUser}/>
    <Route path="/myevents" component={MyEvents} onEnter={validateUser}/>
    <Route path="/myaccount" component={AccountSettings} onEnter={validateUser}/>
    <Route path="/logout" onEnter={logoutUser}/>
  </Route>
);


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

  if (Meteor.isClient) {
    // Get all necessary subscriptions
    Meteor.subscribe('userpreferences', {
      onReady: function() {
        // Find the preference set for the current user.
        let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

        if (!Meteor.userId() || !preferences || preferences.location) {
          transitionFunc(getPathsForUser()[0].path);
        }

        done();
      }
    });
  } else {
    done();
  }
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
    if (Meteor.isClient) {
      // Get all necessary subscriptions
      Meteor.subscribe('userpreferences', {
        onReady: function() {
          // Find the preference set for the current user.
          let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

          if (!preferences || !preferences.location) {
            transitionFunc('/welcome');
          }

          done();
        }
      });
    } else {
      done();
    }
  }


  if (!pathIsValidForUser(nextState.location.pathname)) {
    let transitionURL = getPathsForUser()[0].path;
    Logger.debug('Redirecting to %s', transitionURL);
    transitionFunc(transitionURL);
  }
}

function logoutUser(nextState, transitionFunc, done) {
  Meteor.logout(function(err) {
    if (!err) {
      transitionFunc('/login');
    }
    done();
  });
}
