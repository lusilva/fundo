import Paths from './client/paths';

export function userIsValid() {
    return !!Meteor.userId() && Meteor.user().emails[0].verified
}

export function getPathsForUser() {
    if (userIsValid()) {
        return Paths.loggedIn;
    } else if (!!Meteor.userId()) {
        return Paths.notValid;
    } else {
        return Paths.loggedOut;
    }
}