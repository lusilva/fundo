import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';

Meteor.publish('userpreferences', function () {
    return PreferenceSet.getCollection().find({userId: this.userId});
});

Meteor.publish('events', function (limit, city) {
    if (this.userId) {
        var dl = limit || 10;
        return Event.getCollection().find({relevant_cities: {$in: [city]}}, {limit: dl, sort: {popularity_score: -1}});
    }
    return null;
});