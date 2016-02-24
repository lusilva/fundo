import { refresh } from './refresh';

SyncedCron.add({
    name: 'refresh',
    schedule: function (parser) {
        // parser is a later.parse object
        return parser.text(Meteor.settings.refreshEventsEvery || 'every 12 hours');
    },
    job: refresh
});