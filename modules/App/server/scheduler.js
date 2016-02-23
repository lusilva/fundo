
import refreshFunc from './cache/refresh';

SyncedCron.add({
    name: 'Refresh Event Cache',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 24 hours');
    },
    job: refreshFunc
});