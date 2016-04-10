/* global Accounts FastRender Winston */

import PreferenceSet from 'imports/collections/PreferenceSet';
import 'imports/collections/Event';
import 'imports/collections/Category';
import 'imports/server/methods';
import 'imports/logger';
import 'imports/server/hooks/events';
import 'imports/server/publications';
import 'imports/server/fixtures';
import 'imports/server/cache/scheduler';

// Every time a user account is created, create an empty preference set for that user. This ensures that a user
// always has a preference set associated with them, since it is impossible for a user to delete a preference set.
Accounts.onCreateUser(function(options, user) {
  let preferences = new PreferenceSet(null, user._id, null, null);
  preferences.save();
  return user;
});

// FastRender passes subscription data to pages on load, so that client doesn't
// have to wait for subscription to be ready.
FastRender.route('/dashboard', function(params) {
  this.subscribe('events', new Date());
  this.subscribe('categories');
});

FastRender.route('/myevents', function(params) {
  this.subscribe('savedevents');
});

// In production only, set email templates.
if (process.env.NODE_ENV === 'production') {
  // Formatting for emails.
  Accounts.emailTemplates.siteName = 'fundo';

  // Subject line of the email.
  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return 'Welcome to fundo, the ultimate event discovery tool!';
  };

  // Load Webpack infos for SSR
  // ReactRouterSSR.LoadWebpackStats(WebpackStats);
  // require('./routes').default;
} else {
  Winston.level = 'debug';
}
