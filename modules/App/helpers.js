import Paths from './client/paths';

export function isUserVerified(user) {
    if (!!user && user.emails && user.emails.length > 0)
        return user.emails[0].verified;
    return false;
}

export function getPathsForUser() {
    if (!!Meteor.userId()) {
        return Paths.loggedIn;
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