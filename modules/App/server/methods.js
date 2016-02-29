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
    "like": function (eventId) {
        if (this.userId)
            Raccoon.liked(this.userId, eventId);
    },
    "getRecommendations": function (count) {
        if (this.userId)
            Raccoon.recommendFor(this.userId, 10, function (results) {
                console.log(results);
            });
    },
    "likedCount": function (eventId) {
        Raccoon.likedCount(eventId, function (results) {
            console.log(results);
            // returns the number of users who have liked that item.
        });
    }
});