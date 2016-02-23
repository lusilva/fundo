import getAllEventsForCity from 'App/server/eventful/reader';
import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';
import Logger from 'App/logger';

Meteor.methods({
    "refresh": function() {refresh()}
});

export default function refresh() {
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
};


function updateAllEventsForCity(city) {
    // Get all events for the city
    getAllEventsForCity(city, createEvent.bind(this, city));
}

function createEvent(city, event) {

    let dbEvent = new Event(
        event.id,
        null,
        [city],
        event.title,
        event.description,
        event.popularity_score,
        {
            lat: event.latitude,
            lng: event.longitude
        },
        event.start_time,
        event.stop_time,
        event.image,
        {
            address: event.venue_address,
            name: event.venue_name,
            url: event.venue_url
        },
        event.url,
        event.price,
        _.pluck(event.categories.category, 'name')
    );
    dbEvent.save(function (err, res) {
        if (err) {
            Logger.error('ERROR: could not save event %s', event.id, err);
        }
    });
}
