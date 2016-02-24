import getAllEventsForCity from 'App/server/eventful/reader';
import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';

Meteor.methods({
    "refresh": function () {
        refresh()
    }
});

export function refresh() {
    // Remove all events that have already happened. THIS CAN'T REALLY BE DONE YET BECAUSE OF TIMEZONE ISSUES.
    // Event.getCollection().remove({stop_time: {$gte: new Date()}});

    // Remove all events that have expired.
    Event.getCollection().remove({expires: {$gte: new Date().toISOString()}});

    // Get all the cities with users. This returns a unique array of cities.
    let cities = _.uniq(_.pluck(PreferenceSet.getCollection().find().fetch(), 'location'));

    // For each city, get all events in the city and update the event database. If an event is already in the database,
    // it will not be duplicated.
    _.each(cities, function (city) {
        updateAllEventsForCity(city);
    });
}


export function updateAllEventsForCity(city) {
    // Get all events for the city
    getAllEventsForCity(city, createEventfulEvent.bind(this, city));
}
