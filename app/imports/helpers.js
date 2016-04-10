/* global Meteor */

import Paths from './client/paths';

/**
 * Check if this user has verified their email.
 *
 * @param {Meteor.user} user - The user to check if verified.
 * @returns {boolean}
 */
export function isUserVerified(user) {
  if (Boolean(user) && user.emails && user.emails.length > 0)
    return Boolean(user.emails[0].verified);
  return false;
}

/**
 * Get all the paths that this user is allowed to see.
 *
 * @return {Array} The paths that valid for the user.
 */
export function getPathsForUser() {
  let loggedIn = false;
  if (Meteor.isClient) {
    loggedIn = Boolean(Meteor.userId()) || Meteor.loggingIn();
  } else {
    loggedIn = Boolean(Meteor.userId());
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
 * @param {string} path - The path to check.
 * @return {boolean} Whether this path is valid for the user or not.
 */
export function pathIsValidForUser(path) {
  let validPaths = getPathsForUser();

  let isValid = false;

  validPaths.forEach(function(validPath) {
    if (validPath.path === path) {
      isValid = true;
    }
  });

  return isValid;
}