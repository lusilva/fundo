// Methods for optimistic updates
import 'App/methods';

import './routes';

// To activate the unit tests:
// - meteor add sanjo:jasmine
// - meteor add velocity:html-reporter
// - uncomment them on entry/client/entry.js and entry/server/entry.js

/*if (process.env.NODE_ENV !== 'production') {
 if (process.env.FRAMEWORK === 'jasmine-client-integration') {
 // Run the integration tests on the mirror
 const context = require.context('../../modules', true, /\/client\/(.*)\/integration\/(.*)\-test\.jsx?$/);
 context.keys().forEach(context);
 } else {
 // Run unit tests on client
 const context = require.context('../../modules', true, /\/client\/(.*)\/unit\/(.*)\-test\.jsx?$/);
 context.keys().forEach(context);
 }
 }*/
