import PreferenceSet from 'App/collections/PreferenceSet';
import Event from "App/collections/Event";
import Logger from 'App/logger';
import Raccoon from '../lib/raccoon/index';


Meteor.methods({
    "log": function (level, logArguments) {
        logArguments.unshift(level);
        if (Meteor.isServer)
            Winston.log.apply(this, logArguments);
    },
    "resendEmailVerification": function () {
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    "checkIfUserValid": function (callback) {
        if (!!Meteor.user() && Meteor.user().emails.length > 0)
            return Meteor.user().emails[0].verified;
        else
            return !!this.userId;
    },
    "guessUserLocation": function () {
        let ip = this.connection.clientAddress;
        console.log(ip);
    },
    "getEventsForUser": function (userPref) {
        var userCity = userPref._location;
        return Event.findEventsInCity(userCity).fetch();
    },
    "updatePreferences": function (preferences) {
        let newPrefs = new PreferenceSet(
            preferences._id,
            this.userId,
            preferences._indices,
            preferences._location
        );
        newPrefs.save(function (err, res) {
            if (err) {
                Logger.error('could not update preference set for user %s', this.userId, err);
            } else {
                Logger.debug('successfully updated preference set for user %s', this.userId, res);
            }
        }.bind(this));

        return Event.getCollection().find({relevant_cities: {$in: [newPrefs.location]}}).fetch();
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
            if (!event || _.contains(event.likes, this.userId)) return;

            // Call like on the event.
            event.like(function (err, res) {
                if (!err) {
                    Raccoon.liked(this.userId, eventId);
                } else {
                    Logger.error('error liking event %s', eventId, err);
                }
            }.bind(this));
        } else {
            throw new Meteor.Error('invalid request');
        }
    },
    "dislike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || _.contains(event.dislikes, this.userId)) return;

            event.dislike(function (err, res) {
                if (!err) {
                    Raccoon.disliked(this.userId, eventId);
                } else {
                    Logger.error('error disliking event %s', eventId, err);
                }
            }.bind(this));
        } else {
            throw new Meteor.Error('invalid request');
        }
    },
    "unlike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || !_.contains(event.likes, this.userId)) return;

            event.unlike(function (err, res) {
                if (!err) {
                    Raccoon.unliked(this.userId, eventId);
                } else {
                    Logger.error('error unliking event %s', eventId, err);
                }
            }.bind(this));
        } else {
            throw new Meteor.Error('invalid request');
        }
    },
    "undislike": function (eventId) {
        if (this.userId && eventId) {
            // Get the event and make sure its valid.
            let event = Event.getCollection().findOne({_id: eventId});
            if (!event || !_.contains(event.dislikes, this.userId)) return;

            event.undislike(function (err, res) {
                if (!err) {
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
            Raccoon.recommendFor(this.userId, 10, function (results) {
                console.log(results);
            });
        } else {
            throw new Meteor.Error('invalid request');
        }
    }
});