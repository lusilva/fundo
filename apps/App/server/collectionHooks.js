import Event from 'App/collections/Event';
import Logger from 'App/logger';
import Raccoon from 'App/lib/raccoon';

const Events = Event.getCollection();

/**
 * Hooks that run when events are modified in the database, responsible for logging/cleanup.
 */
Events.before.insert(function (userId, doc) {
    let now = new Date();
    doc.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
    Logger.debug('Inserting event %s', doc._id);
});

Events.before.update(function (userId, doc, fieldNames, modifier, options) {
    let now = new Date();
    modifier.$set = modifier.$set || {};
    modifier.$set.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
    Logger.debug('Updating event %s', doc._id);
});

Events.before.remove(function (userId, doc) {
    Logger.debug('Removing event %s', doc._id, {expires: doc.expires});

    if (Raccoon) {
        if (doc.likes && doc.likes.length > 0) {
            _.each(doc.likes, function (userId) {
                Raccoon.unliked(userId, doc._id);
            });
        }

        if (doc.dislikes && doc.dislikes.length > 0) {
            _.each(doc.dislikes, function (userId) {
                Raccoon.undisliked(userId, doc._id);
            });
        }
    }
});
