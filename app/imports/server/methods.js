import PreferenceSet from 'imports/collections/PreferenceSet';
import Event from 'imports/collections/Event';
import Category from 'imports/collections/Category';
import Logger from 'imports/logger';
import Scheduler from './cache/scheduler';
import EventfulFactory from 'imports/factories/EventfulFactory';

import _ from 'lodash';
import truncate from 'truncate-html';
import Raccoon from '../lib/raccoon/index';


Meteor.methods({
  /**
   * Log method used by the Logger, not meant to be used by itself.
   *
   * @param level
   * @param logArguments
   */
  "log": function(level, logArguments) {
    logArguments.unshift(level);
    if (Meteor.isServer)
      Winston.log.apply(this, logArguments);
  },
  /**
   * Method to resend the verification email to the user.
   */
  "resendEmailVerification": function() {
    Accounts.sendVerificationEmail(Meteor.userId());
  },
  /**
   * Check if a user has verfied their email.
   *
   * @returns {*}
   */
  "checkIfUserValid": function() {
    if (!!Meteor.user() && Meteor.user().emails.length > 0)
      return Meteor.user().emails[0].verified;
    else
      return !!this.userId;
  },
  /**
   * Method to update user preferences.
   *
   * @param preferences
   * @param eventsReadyCallback
   */
  "updatePreferences": function(preferences) {

    //TODO: sanitize the incoming preferences object for security.

    // create new preference set.
    let newPrefs = new PreferenceSet(
      preferences._id,
      this.userId,
      preferences._indices,
      preferences._location
    );

    // save it in the database.
    newPrefs.save(function(err, res) {
      if (err) {
        Logger.error('could not update preference set for user %s', this.userId, err);
      } else {
        Logger.debug('successfully updated preference set for user %s', this.userId, res);
      }
    }.bind(this));

    // If there are no events in the user's current city, then fetch some.
    if (Event.findEventsInCity(preferences._location).count() == 0) {

      // Add a cron job to automatically refresh this city every 24 hours.
      SyncedCron.add({
        name: 'eventful-' + preferences._location,
        schedule: function(parser) {
          // parser is a later.parse object
          return parser.text(Meteor.settings.refreshEventsEvery || 'every 2 hours');
        },
        job: Scheduler.getCity.bind(this, preferences._location)
      });

      let job = Scheduler.getCity(preferences._location);
      return job._doc._id;
    } else {
      return null;
    }
  },
  /**
   * Method to like an event.
   *
   * @param eventId
   */
  "like": function(eventId) {
    if (this.userId && eventId) {
      // Get the event, and make sure its valid.
      let event = Event.getCollection().findOne({_id: eventId});
      if (!event || _.includes(event.likes, this.userId)) return;

      // Call like on the event.
      event.like(function(err, res) {
        if (!err) {
          if (Raccoon)
            Raccoon.liked(this.userId, eventId);
        } else {
          Logger.error('error liking event %s', eventId, err);
        }
      }.bind(this));
    } else {
      throw new Meteor.Error('invalid request');
    }
  },
  /**
   * Method to dislike an event.
   *
   * @param eventId
   */
  "dislike": function(eventId) {
    if (this.userId && eventId) {
      // Get the event and make sure its valid.
      let event = Event.getCollection().findOne({_id: eventId});
      if (!event || _.includes(event.dislikes, this.userId)) return;

      event.dislike(function(err, res) {
        if (!err) {
          if (Raccoon)
            Raccoon.disliked(this.userId, eventId);
        } else {
          Logger.error('error disliking event %s', eventId, err);
        }
      }.bind(this));
    } else {
      throw new Meteor.Error('invalid request');
    }
  },
  /**
   * Undo of like.
   *
   * @param eventId
   */
  "unlike": function(eventId) {
    if (this.userId && eventId) {
      // Get the event and make sure its valid.
      let event = Event.getCollection().findOne({_id: eventId});
      if (!event || !_.includes(event.likes, this.userId)) return;

      event.unlike(function(err, res) {
        if (!err) {
          if (Raccoon)
            Raccoon.unliked(this.userId, eventId);
        } else {
          Logger.error('error unliking event %s', eventId, err);
        }
      }.bind(this));
    } else {
      throw new Meteor.Error('invalid request');
    }
  },
  /**
   * Undo of dislike.
   *
   * @param eventId
   */
  "undislike": function(eventId) {
    if (this.userId && eventId) {
      // Get the event and make sure its valid.
      let event = Event.getCollection().findOne({_id: eventId});
      if (!event || !_.includes(event.dislikes, this.userId)) return;

      event.undislike(function(err, res) {
        if (!err) {
          if (Raccoon)
            Raccoon.undisliked(this.userId, eventId);
        } else {
          Logger.error('error undisliking event %s', eventId, err);
        }
      }.bind(this));
    } else {
      throw new Meteor.Error('invalid request');
    }
  },
  "getRecommendations": function() {
    if (this.userId) {
      if (Raccoon) {
        let recommend = Meteor.wrapAsync(Raccoon.recommendFor, Raccoon);
        return recommend(this.userId, 20);
      }
    } else {
      throw new Meteor.Error('invalid request');
    }
  },
  "addCategory": function(category) {
    let categoryDoc = new Category({
      name: truncate(category.name, {
        length: 100,
        stripTags: true,
        ellipsis: '...',
        excludes: ['img', 'br'],
        decodeEntities: true
      }),
      category_id: category.id,
      subcategory: category.name.indexOf(':') > -1
    });
    categoryDoc.save(function(err, res) {
      if (err) {
        Logger.error(err);
      }
    });
  },
  "addEvent": function(event, existingEvent, city) {
    EventfulFactory.createEvent(city, event, existingEvent);
  }
});
