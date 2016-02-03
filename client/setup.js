/* global InjectTapEventPlugin */

Meteor.startup(function () {
    // Needed for onTouchTap
    // Can go away when react 1.0 release
    // Check this repo:
    // https://github.com/zilverline/react-tap-event-plugin
    InjectTapEventPlugin();

    console.log("Client Ready");
});