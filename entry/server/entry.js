/**
 * This is the main entry point in the server. Import any code here that you want the server
 * to see/execute when it initially starts up.
 */

import PreferenceSet from 'App/collections/PreferenceSet';
import 'App/collections/Event';
import 'App/server/methods';
import 'App/logger';
import 'App/server/publications';
import 'App/server/fixtures';
import 'App/server/cache/scheduler';

// If debug is enabled, print debug statements to the server console. Else, they will not be printed.
if (Meteor.settings.debugEnabled)
    Winston.level = 'debug';

// Every time a user account is created, create an empty preference set for that user. This ensures that a user
// always has a preference set associated with them, since it is impossible for a user to delete a preference set.
Accounts.onCreateUser(function (options, user) {
    let preferences = new PreferenceSet(null, user._id, null, null);
    preferences.save();
    return user;
});

// Do server-rendering only in production mode
if (process.env.NODE_ENV === 'production') {

    // Formatting for emails.
    Accounts.emailTemplates.siteName = 'fundo';

    //-- Subject line of the email.
    Accounts.emailTemplates.verifyEmail.subject = function (user) {
        return 'Welcome to fundo, the ultimate event discovery tool!';
    };

    // Load Webpack infos for SSR
    ReactRouterSSR.LoadWebpackStats(WebpackStats);

    require('../client/routes');
} else {
    // To activate the unit tests:
    // - meteor add sanjo:jasmine
    // - meteor add velocity:html-reporter
    // - uncomment them on entry/client/entry.js and entry/server/entry.js

    // Add fixtures required for integration tests
    /*const context = require.context('../../modules', true, /\/server\/(.*)\/integration\/(.*)\-fixtures\.jsx?$/);
     context.keys().forEach(context);

     if (process.env.FRAMEWORK === 'jasmine-server-integration') {
     // Run integration tests on server
     const context = require.context('../../modules', true, /\/server\/(.*)\/integration\/(.*)\-test\.jsx?$/);
     context.keys().forEach(context);
     }*/
}
