import PreferenceSet from "App/collections/PreferenceSet";
import Event from "App/collections/Event";

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
        
        // var userID = this.userId;
        // // else get and return events for user's city from db
        // var userPref = PreferenceSet.getCollection().findOne({userId: userID});
        

        // null check

        var userCity = userPref._location;

        console.log(Event.getCollection().find({}).fetch()[0]);

        console.log(userPref);


        var events = [Event.getCollection().findOne({relevant_cities: { $in: [userCity] } } )];

        console.log(events);

        return events;
    }
});