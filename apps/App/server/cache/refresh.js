import getAllEventsForCity from 'App/server/eventful/reader';
import Event from 'App/collections/Event';
import Category from 'App/collections/Category';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';

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
    getAllEventsForCity(city, createEventfulEvent.bind(this, city));

    Meteor.setTimeout(findSimilarEvents.bind(this, city), 15 * 1000);
}


function findSimilarEvents(city) {

    let events = Event.findEventsInCity(city).fetch();

    console.log("FINDING SIMILAR EVENTS FOR " + events.length);

    _.each(events, function (event) {
        // If event doesn't have a start time, then give up :(
        if (!event.start_time)
            return [];

        let tolerableStartTime = new Date(event.start_time.getTime() - (60 * 60 * 24 * 7 * 1000));
        let tolerableEndTime = new Date(event.start_time.getTime() + (60 * 60 * 24 * 7 * 1000));

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

            return (stringSimilarity.compareTwoStrings(possibleSimilarEvent.title, event.title) > 0.5 &&
                stringSimilarity.compareTwoStrings(possibleSimilarEvent.description, event.description) > 0.5);
        });

        if (similarEvents.length > 0) {
            console.log("-------------------------------");
            console.log('Events similar to --- ' + event.title);
            _.each(similarEvents, function (event) {
                console.log(event.title);
            });
            console.log("-------------------------------");
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
