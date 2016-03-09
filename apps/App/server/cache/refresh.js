import getAllEventsForCity from 'App/server/eventful/reader';
import Event from 'App/collections/Event';
import Category from 'App/collections/Category';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';

import _ from 'lodash';
import truncate from 'truncate-html';
import stringSimilarity from 'string-similarity';

/**
 * Updates the cache by removing expired collections.
 * This is called by the scheduler periodically.
 */
export function refresh() {
    Logger.info('checking for expired events', new Date());
    // Remove all events that have already happened. THIS CAN'T REALLY BE DONE YET BECAUSE OF TIMEZONE ISSUES.
    // Event.getCollection().remove({stop_time: {$gte: new Date()}});

    // Remove all events that have expired.
    Event.getCollection().remove({expires: {$lt: new Date()}});

    // Update all categories from eventful.
    updateAllCategories();

    // Remove all categories that have expired.
    Category.getCollection().remove({expires: {$lt: new Date()}});
}

/**
 * Fetches all events for a particular city from eventful.
 * @param city {string} - The city to fetch events for.
 */
export function updateAllEventsForCity(city) {
    // Get all events for the city.
    getAllEventsForCity(city, createEventfulEvent.bind(this, city), updateAllEventsForCityCallback.bind(this, city));
}

/**
 * Callback function that runs when all events have been fetched for a particular city.
 * @param city
 */
function updateAllEventsForCityCallback(city) {
    // Find similar events and mark them as similar.
    findAndMarkSimilarEvents(city);
}

/**
 * Find all events that are similar to each other in a particular city.
 *
 * @param city
 */
function findAndMarkSimilarEvents(city) {

    // Get all the events in this city.
    let events = Event.findEventsInCity(city).fetch();

    // For each event, find all events similar to it.
    _.each(events, function (event) {
        // If event doesn't have a start time, then give up :(
        if (!event.start_time)
            return [];

        // Only check for similar events close in time to the current event.
        let tolerableStartTime = new Date(event.start_time.getTime() - (60 * 60 * 24 * 7 * 1000));
        let tolerableEndTime = new Date(event.start_time.getTime() + (60 * 60 * 24 * 7 * 1000));

        // Get all the similar events to this event based on time and edit distance between title and description.
        let similarEvents = _.filter(events, function (possibleSimilarEvent) {
            if (possibleSimilarEvent.id == event.id)
                return false;

            // Make sure this event has a start time.
            if (!possibleSimilarEvent.start_time)
                return false;

            // Check if this event's start time is within the tolerance.
            if (possibleSimilarEvent.start_time.getTime() > tolerableEndTime.getTime() ||
                possibleSimilarEvent.start_time.getTime() < tolerableStartTime.getTime()) {
                return false;
            }

            let descriptionsMatch = possibleSimilarEvent.description && event.description &&
                stringSimilarity.compareTwoStrings(possibleSimilarEvent.description, event.description) > 0.5;


            return (
                stringSimilarity.compareTwoStrings(possibleSimilarEvent.title, event.title) > 0.5 &&
                descriptionsMatch
            );
        });


        similarEvents = _.map(similarEvents, function (event) {
            return event.id;
        });

        // If the similar events are different then the current similar events, update it.
        if (!_.isEqual(similarEvents, event.similar_events)) {
            if (similarEvents.length > 0) {
                Logger.debug('Found similar events for event %s', event.id, similarEvents);
            }
            event.similar_events = similarEvents;
            event.save(function (err, res) {
                if (err) {
                    Logger.error('error occurred while saving similar events for event %s', event.id, err);
                }
            });
        }
    });
}


/**
 * Fetches all categories from eventful and updates them in the database.
 */
function updateAllCategories() {

    let result = Meteor.http.get("http://api.eventful.com/json/categories/list",
        {
            timeout: 30000,
            params: {
                app_key: Meteor.settings.eventfulAPIKey,
                subcategories: 1
            }
        });

    if (result.statusCode != 200 || !result.data) {
        Logger.error('could not update categories from eventful');
        return;
    }

    let data = result.data;
    _.each(data.category, function (category) {
        let categoryDoc = new Category({
            name: truncate(category.name, {
                length: 100,
                stripTags: true,
                ellipsis: '...',
                excludes: ['img', 'br'],
                decodeEntities: true
            }),
            category_id: category.id
        });
        categoryDoc.save(function (err, res) {
            if (err) {
                Logger.error(err);
            }
        });
    });
}
