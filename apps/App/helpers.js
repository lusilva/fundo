import Paths from './client/paths';


/**
 * Check if this user has verified their email.
 *
 * @param user
 * @returns {*}
 */
export function isUserVerified(user) {
    if (!!user && user.emails && user.emails.length > 0)
        return user.emails[0].verified;
    return false;
}


/**
 * Get all the paths that this user is allowed to see.
 *
 * @returns {Array}
 */
export function getPathsForUser() {
    let loggedIn = false;
    if (Meteor.isClient) {
        loggedIn = !!Meteor.userId() || Meteor.loggingIn();
    } else {
        loggedIn = !!Meteor.userId();
    }

    if (loggedIn) {
        return Paths.loggedIn;
    } else {
        return Paths.loggedOut;
    }
}


/**
 * Check if a path is valid for the current user.
 *
 * @param path
 * @returns {boolean}
 */
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