import getAllEventsForCity from 'App/server/eventful/reader';
import Event from 'App/collections/Event';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';

/**
 * Updates the cache by removing expired collections.
 * This is called by the scheduler periodically.
 */
export function refresh() {
    Logger.info('checking for expired events', new Date());
    // Remove all events that have already happened. THIS CAN'T REALLY BE DONE YET BECAUSE OF TIMEZONE ISSUES.
    // Event.getCollection().remove({stop_time: {$gte: new Date()}});

    // Remove all events that have expired.
    Event.getCollection().remove({expires: {$gte: new Date().toISOString()}});
}

/**
 * Fetches all events for a particular city from eventful.
 * @param city {string} - The city to fetch events for.
 */
export function updateAllEventsForCity(city) {
    // Get all events for the city
    getAllEventsForCity(city, createEventfulEvent.bind(this, city));
}
