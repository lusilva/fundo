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
    let likes = [];
    let dislikes = [];
    let similar_events = event.similar_events;
    let relevant_cities = [city];
    if (!!existingEvent) {
        owners = existingEvent.owners;
        relevant_cities = _.union(relevant_cities, existingEvent.relevant_cities);

        likes = _.union(likes, existingEvent.likes);
        dislikes = _.union(dislikes, existingEvent.dislikes);

        similar_events = _.union(similar_events, existingEvent.similar_events);
    }

    event = {
        _id: event.id,
        owners: owners,
        relevant_cities: relevant_cities,
        title: event.title,
        description: event.description,
        popularity_score: event.popularity,
        position: {
            lat: event.latitude,
            lng: event.longitude
        },
        tickets: event.tickets,
        start_time: event.start_time,
        stop_time: event.stop_time,
        image: event.image,
        venue: {
            address: event.venue_address,
            name: event.venue_name,
            url: event.venue_url
        },
        url: event.url,
        links: event.links,
        price: event.price,
        categories: _.pluck(event.categories.category, 'name'),
        likes: likes,
        dislikes: dislikes,
        similar_events: similar_events
    };

    let dbEvent = new Event(event);
    dbEvent.save(function (err, res) {
        if (err) {
            Logger.error('ERROR: could not save event %s', event.id, err);
        }
    });
}