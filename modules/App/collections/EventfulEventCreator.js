import Logger from 'App/logger';
import Event from './Event';

/**
 * Function to create an event object and save it to the database from eventful data.
 * @param city The queried city that this is an event for.
 * @param event The eventful formatted event.
 */
export default function createEvent(city, event) {

    // If this event already exists, then make the owners and the relevant cities the union of
    // what already exists and the new information. THIS IS VERY IMPORTANT TO CATEGORIZE CITIES AND
    // KEEP TRACK OF SAVED EVENTS.
    let existingEvent = Event.getCollection().findOne({_id: event.id});
    let owners = [];
    let relevant_cities = [city];
    if (!!existingEvent) {
        owners = existingEvent.owners;
        relevant_cities = _.union(relevant_cities, existingEvent.relevant_cities);
    }

    let dbEvent = new Event(
        event.id,
        owners,
        relevant_cities,
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