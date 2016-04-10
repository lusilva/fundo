import Event from 'imports/collections/Event';
import Category from 'imports/collections/Category';
import Logger from 'imports/logger';

import _ from 'lodash';
import stringSimilarity from 'string-similarity';


/**
 * Find all events that are similar to each other in a particular city.
 *
 * @param city
 */
function findAndMarkSimilarEvents(city) {

  // Get all the events in this city.
  let events = Event.findEventsInCity(city).fetch();

  // For each event, find all events similar to it.
  _.each(events, function(event) {
    // If event doesn't have a start time, then give up :(
    if (!event.start_time)
      return [];

    // Only check for similar events close in time to the current event.
    let tolerableStartTime = new Date(event.start_time.getTime() - (60 * 60 * 24 * 7 * 1000));
    let tolerableEndTime = new Date(event.start_time.getTime() + (60 * 60 * 24 * 7 * 1000));

    // Get all the similar events to this event based on time and edit distance between title and description.
    let similarEvents = _.filter(events, function(possibleSimilarEvent) {
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


    similarEvents = _.map(similarEvents, function(event) {
      return event.id;
    });

    // If the similar events are different then the current similar events, update it.
    if (!_.isEqual(similarEvents, event.similar_events)) {
      if (similarEvents.length > 0) {
        Logger.debug('Found similar events for event %s', event.id, similarEvents);
      }
      event.similar_events = similarEvents;
      event.save(function(err, res) {
        if (err) {
          Logger.error('error occurred while saving similar events for event %s', event.id, err);
        }
      });
    }
  });
}
