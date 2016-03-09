/**
 * Created by lusilva on 2/21/16.
 */


import Logger from 'App/logger';
import getUrls from 'get-urls';
import truncate from 'truncate-html';
import _ from 'lodash';

export default function getEventsForCity(city, eventCreatorCallback, doneCallback, opt_page) {
    const page_size = 50;
    const days = 30;
    const page = opt_page || 1;
    const MAX_PAGES_TO_FETCH = Meteor.settings.maxPagesPerCity || 50;

    Logger.debug('CITY: %s | PAGE: %d', city, page, {time: new Date()});

    let done = false;
    let today = new Date();
    let endDate = new Date();
    endDate.setDate(today.getDate() + days);
    let date = formatEventfulDate(today) + "-" + formatEventfulDate(endDate);


    Meteor.http.get("http://api.eventful.com/json/events/search",
        {
            timeout: 30000,
            params: {
                app_key: Meteor.settings.eventfulAPIKey,
                page_size: page_size,
                date: date,
                where: city,
                within: '20',
                units: 'miles',
                sort_order: 'popularity',
                page_number: page,
                include: "price,categories,tickets,popularity,subcategories,mature",
                image_sizes: "medium,block,large,edpborder250,dropshadow250,dropshadow170,block178",
                mature: "normal",
                languages: "1"
            }
        },
        function (error, result) {
            if (error || result.statusCode != 200) {
                Logger.error("could not fetch events from eventful for %s", city, error || JSON.parse(result.content));
                return;
            }
            let resultJSON = JSON.parse(result.content);

            let events = resultJSON.events.event;

            // If this isn't the last page, then recurse and get started on the next eventful fetch.
            if (Math.min(resultJSON.page_count, MAX_PAGES_TO_FETCH) > page) {
                getEventsForCity(city, eventCreatorCallback, doneCallback, page + 1);
            } else {
                done = true;
            }

            _.each(events, function (event, index) {

                // If this event is not in english or undetermined, then don't save it.
                // This is done because undetermined events can still be high quality.
                if (!event.language ||
                    (event.language.toLowerCase() != 'english' && event.language.toLowerCase() != 'undetermined')) {
                    return;
                }

                //Parse out all html tags from the description, and convert it to normal text.
                let description = truncate(event.description || "", {
                    length: 1000,
                    stripTags: false,
                    ellipsis: '...',
                    excludes: ['img', 'br'],
                    decodeEntities: true
                });

                description = !description || description == 'null' || description.length == 0 ?
                    null : description;


                // Extract any links from the description.
                event.links = event.description ? getUrls(event.description) : [];

                // Format the event category.
                _.map(event.categories.category, function (category) {
                    category.name = truncate(category.name, {
                        length: 100,
                        stripTags: true,
                        ellipsis: '...',
                        excludes: ['img', 'br'],
                        decodeEntities: true
                    });
                    return category;
                });


                event.start_time = event.start_time ? new Date(event.start_time) : null;
                event.stop_time = event.stop_time ? new Date(event.stop_time) : null;


                event.description = description;
                eventCreatorCallback(event);
            });

            if (done) {
                doneCallback();
            }
        });
}

function formatEventfulDate(date) {
    var string = "";
    string += date.getFullYear();
    if (date.getMonth() < 9) {
        string += "0";
    }
    string += (date.getMonth() + 1);
    if (date.getDate() < 10) {
        string += "0";
    }
    string += date.getDate();
    string += "00";

    return string;
}
