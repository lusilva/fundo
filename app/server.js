import { ReactRouterSSR } from 'meteor/reactrouter:react-router-ssr';

import PreferenceSet from 'imports/collections/PreferenceSet';
import Event from  'imports/collections/Event';
import 'imports/collections/Category';
import 'imports/server/methods';
import 'imports/logger';
import 'imports/server/hooks/events';
import 'imports/server/publications';
import 'imports/server/fixtures';
import 'imports/server/cache/scheduler';

// If debug is enabled, print debug statements to the server console. Else, they will not be printed.
if (Meteor.settings.debugEnabled)
  Winston.level = 'debug';

// Every time a user account is created, create an empty preference set for that user. This ensures that a user
// always has a preference set associated with them, since it is impossible for a user to delete a preference set.
Accounts.onCreateUser(function(options, user) {
  let preferences = new PreferenceSet(null, user._id, null, null);
  preferences.save();
  return user;
});

FastRender.route('/dashboard', function(params) {
  this.subscribe('events', new Date());
  this.subscribe('categories');
});

FastRender.route('/myevents', function(params) {
  this.subscribe('savedevents');
});


// Do server-rendering only in production
// Otherwise, it will break the hot-reload
// DO NOT REMOVE THIS LINE TO TEST, use: meteor --production
if (process.env.NODE_ENV === 'production') {

  // Formatting for emails.
  Accounts.emailTemplates.siteName = 'fundo';

  //-- Subject line of the email.
  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return 'Welcome to fundo, the ultimate event discovery tool!';
  };

  // Load Webpack infos for SSR
  //ReactRouterSSR.LoadWebpackStats(WebpackStats);
  //
  //require('./routes').default;
}
