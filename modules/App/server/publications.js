import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';

Meteor.publish('userpreferences', function() {
    return PreferenceSet.getCollection().find({userId: this.userId});
});

Meteor.publish('events', function() {
    let city = PreferenceSet.getCollection().findOne({userId: this.userId}).location;
    return Event.findEventsInCity(city);
});