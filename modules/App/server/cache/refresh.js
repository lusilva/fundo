import getAllEventsForCity from 'App/server/eventful/reader';
import Event from 'App/collections/Event';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';

export function refresh() {
    Logger.info('checking for expired events', new Date());
    // Remove all events that have already happened. THIS CAN'T REALLY BE DONE YET BECAUSE OF TIMEZONE ISSUES.
    // Event.getCollection().remove({stop_time: {$gte: new Date()}});

    // Remove all events that have expired.
    Event.getCollection().remove({expires: {$gte: new Date().toISOString()}});
}


export function updateAllEventsForCity(city) {
    // Get all events for the city
    getAllEventsForCity(city, createEventfulEvent.bind(this, city));
}
