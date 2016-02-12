import Paths from './client/paths';

// TODO: Remove this once testing is done.
export function userIsValid() {
    if (!!Meteor.user() && Meteor.user().emails.length > 0)
        return Meteor.user().emails[0].verified;
    else
        return !!Meteor.userId();
}

export function getPathsForUser() {
    if (!!Meteor.user() && Meteor.user().emails.length > 0 && Meteor.user().emails[0].verified) {
        return Paths.loggedIn;
    } else if (!!Meteor.userId()) {
        return Paths.notValid;
    } else {
        return Paths.loggedOut;
    }
}


export function pathIsValidForUser(path) {
    let validPaths = getPathsForUser();

    let isValid = false;

    validPaths.forEach(function (validPath) {
        if (validPath.path === path) {
            isValid = true;
        }
    });

    return isValid;
}