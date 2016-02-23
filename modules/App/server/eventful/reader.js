/**
 * Created by lusilva on 2/21/16.
 */


import Logger from 'App/logger';

export default function getAllEventsForCity(city, eventCreatorCallback) {
    const MAX_PAGES_TO_FETCH = Meteor.settings.maxPagesPerCity || 50;

    let page = 1;
    let pageCount = 1;

    while (page <= Math.min(pageCount, MAX_PAGES_TO_FETCH)) {
        let response = getEvents(city, page, eventCreatorCallback);
        pageCount = response.page_count;
        page += 1;
    }
}


function getEvents(city, page, eventCreatorCallback) {
    const api_key = Meteor.settings.eventfulAPIKey;
    const page_size = 50;
    const days = 30;

    Logger.debug('CITY: %s | PAGE: %d', city, page, {time: new Date()});

    let today = new Date();
    let endDate = new Date();
    endDate.setDate(today.getDate() + days);
    let date = formatEventfulDate(today) + "-" + formatEventfulDate(endDate);

    let requestURL = "http://api.eventful.com/json/events/search?app_key=" + api_key + "&";
    requestURL += "page_size=" + page_size + "&date=" + date + "&where=" + city +
        "&within=20" + "&units=miles" + "&sort_order=popularity" + "&page_number=" + page + "&include=price,categories";
    let result = Meteor.http.get(requestURL, {timeout: 30000});
    if (result.statusCode == 200) {
        let resultJSON = JSON.parse(result.content);

        let events = resultJSON.events.event;

        _.each(events, function (event, index) {
            // Popularity score is a simple measure the order of the results from 0 to 1. Since we
            // are sorting our query by popularity, more popular items should be higher on each page.
            event.popularity_score = 1 - ((page-1)*page_size + index)/resultJSON.total_items;
            eventCreatorCallback(event);
        });

        return resultJSON;
    } else {
        Logger.error("Response issue: %s", result.statusCode);
        let errorJson = JSON.parse(result.content);
        throw new Meteor.Error(result.statusCode, errorJson.error);
    }
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