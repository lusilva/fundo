/**
 * Currently, Meteor doesn't support using require to load modules,
 * so we use this file supported by cosmos:browserify to enable this.
 * Here, any of the NPM modules needed are exported as "app-scope" global variables,
 * meaning they will be accessible in every JavaScript file in the app.
 */
MaterialUI = require("material-ui");
InjectTapEventPlugin = require("react-tap-event-plugin");