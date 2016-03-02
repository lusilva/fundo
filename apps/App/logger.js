/**
 * Logger to log information, using Winston. All logs are server-side.
 */
export default {
    info: function () {
        Meteor.call("log", 'info', arguments);
    },
    error: function () {
        Meteor.call("log", 'error', arguments);
    },
    debug: function () {
        Meteor.call("log", 'debug', arguments);
    },
    warn: function () {
        Meteor.call("log", 'warn', arguments);
    }
};