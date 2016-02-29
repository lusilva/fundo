import getAllEventsForCity from 'App/server/eventful/reader';
import Event from 'App/collections/Event';
import Category from 'App/collections/Category';
import createEventfulEvent from 'App/collections/EventfulEventCreator';
import Logger from 'App/logger';
import htmlToText from 'html-to-text';

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

    // Update all categories from eventful.
    updateAllCategories();

    // Remove all categories that have expired.
    Category.getCollection().remove({expires: {$gte: new Date().toISOString()}});
}

/**
 * Fetches all events for a particular city from eventful.
 * @param city {string} - The city to fetch events for.
 */
export function updateAllEventsForCity(city) {
    // Get all events for the city
    getAllEventsForCity(city, createEventfulEvent.bind(this, city));
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
            name: htmlToText.fromString(category.name),
            category_id: category.id
        });
        categoryDoc.save(function (err, res) {
            if (err) {
                Logger.error(err);
            }
        });
    });
}
