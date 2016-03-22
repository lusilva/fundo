import PreferenceSet from 'App/collections/PreferenceSet';
import Event from "App/collections/Event";
import Logger from 'App/logger';

import _ from 'lodash';
import Raccoon from '../lib/raccoon/index';


Meteor.methods({
    /**
     * Log method used by the Logger, not meant to be used by itself.
     *
     * @param level
     * @param logArguments
     */
    "log": function (level, logArguments) {
        logArguments.unshift(level);
        if (Meteor.isServer)
            Winston.log.apply(this, logArguments);
    },
    /**
     * Method to resend the verification email to the user.
     */
    "resendEmailVerification": function () {
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    /**
     * Check if a user has verfied their email.
     *
     * @returns {*}
     */
    "checkIfUserValid": function () {
        if (!!Meteor.user() && Meteor.user().emails.length > 0)
            return Meteor.user().emails[0].verified;
        else
            return !!this.userId;
    },
    /**
     * TODO: maybe guess the user's location based on their ip address.
     */
    "guessUserLocation": function () {
        let ip = this.connection.clientAddress;
        console.log(ip);
    },
    /**
     * Method to update user preferences.
     *
     * @param preferences
     * @param eventsReadyCallback
     * @returns {boolean}
     */
    "updatePreferences": function (preferences) {

        //TODO: sanitize the incoming preferences object for security.

        // create new preference set.
        let newPrefs = new PreferenceSet(
            preferences._id,
            this.userId,
            preferences._indices,
            preferences._location
        );

        // save it in the database.
        newPrefs.save(function (err, res) {
            if (err) {
                Logger.error('could not update preference set for user %s', this.userId, err);
            } else {
                Logger.debug('successfully updated preference set for user %s', this.userId, res);
            }
        }.bind(this));

        return Event.findEventsInCity(preferences._location).count() == 0;
    },
    /**
     * Method to like an event.
     *
     * @param eventId
     */
    "like": function (eventId) {
        if (this.userId && eventId) {
            // Get the event, and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || _.includes(event.likes, this.userId)) return;

            // Call like on the event.
            event.like(function (err, res) {
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
    "dislike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || _.includes(event.dislikes, this.userId)) return;

            event.dislike(function (err, res) {
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
    "unlike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || !_.includes(event.likes, this.userId)) return;

            event.unlike(function (err, res) {
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
    "undislike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || !_.includes(event.dislikes, this.userId)) return;

            event.undislike(function (err, res) {
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
    "getRecommendations": function () {
        if (this.userId) {
            if (Raccoon) {
                let recommend = Meteor.wrapAsync(Raccoon.recommendFor, Raccoon);
                let result = recommend(this.userId, 10);
                return result;
            }
        } else {
            throw new Meteor.Error('invalid request');
        }
    }
});
