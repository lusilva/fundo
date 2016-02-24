import { refresh } from './refresh';

// Add a cron job to run periodically and run the refresh function to refresh the cache.
// This mainly just checks for expired events and removes them.
SyncedCron.add({
    name: 'refresh',
    schedule: function (parser) {
        // parser is a later.parse object
        return parser.text(Meteor.settings.refreshEventsEvery || 'every 12 hours');
    },
    job: refresh
});


// Start the scheduler.
SyncedCron.start();