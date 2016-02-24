import PreferenceSet from 'App/collections/PreferenceSet';
import 'App/collections/Event';
import 'App/server/methods';
import 'App/logger';
import 'App/server/publications';
import 'App/server/fixtures';
import 'App/server/cache/scheduler';

SyncedCron.start();

if (Meteor.settings.debugEnabled)
    Winston.level = 'debug';

Accounts.onCreateUser(function (options, user) {
    let preferences = new PreferenceSet(null, user._id, null, null);
    preferences.save();
    return user;
});

// Do server-rendering only in production mode
if (process.env.NODE_ENV === 'production') {
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
