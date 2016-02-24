import Logger from 'App/logger';
import Event from './Event';

/**
 * Function to create an event object and save it to the database from eventful data.
 * @param city The queried city that this is an event for.
 * @param event The eventful formatted event.
 */
export default function createEvent(city, event) {

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