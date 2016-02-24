import Logger from 'App/logger';

// Create Events MongoDB collection
const Events = new Meteor.Collection("events", {
    transform: function (doc) {
        return new Event(
            doc._id,
            doc.owners,
            doc.relevant_cities,
            doc.title,
            doc.description,
            doc.popularity_score,
            doc.position,
            doc.start_time,
            doc.stop_time,
            doc.image,
            doc.venue,
            doc.url,
            doc.price,
            doc.categories
        );
    }
});

// A Event class that takes a document in its constructor
export default class Event {

    constructor(id,
                ownerIds,
                relevant_cities,
                title,
                description,
                popularity_score,
                position,
                start_time,
                stop_time,
                image,
                venue,
                url,
                price,
                categories) {
        this._id = id;
        if (!ownerIds) {
            ownerIds = [];
        }
        this._relevant_cities = relevant_cities;
        this._owners = ownerIds;
        this._title = title;
        this._description = description;
        this._popularity_score = popularity_score;
        this._position = position;
        this._start_time = start_time;
        this._stop_time = stop_time;
        this._image = image;
        this._venue = venue;
        this._url = url;
        this._price = price;
        this._categories = categories;
    };

    get id() {
        // readonly
        return this._id;
    };

    get owners() {
        // readonly
        return this._owners;
    };

    get title() {
        return this._title;
    };

    get description() {
        return this._description;
    };

    get position() {
        return this._position;
    };

    get start_time() {
        return this._start_time;
    };

    get stop_time() {
        return this._stop_time;
    };

    get image() {
        return this._image;
    };

    get venue() {
        return this._venue;
    };

    get url() {
        return this._url;
    };

    get price() {
        return this._price;
    };

    get categories() {
        return this._categories;
    };

    get relevant_cities() {
        return this._relevant_cities;
    };

    get popularity_score() {
        return this._popularity_score;
    };

    set relevant_cities(relevant_cities) {
        this._relevant_cities = relevant_cities;
    };

    static getCollection() {
        return Events;
    };

    static numEventsInCity(city) {
        return Event.findEventsInCity(city).count() > 0;
    };

    static findEventsInCity(city) {
        return Event.getCollection().find({relevant_cities: {$in: [city]}});
    };

    save(callback) {
        if (!this.id) {
            throw new Meteor.Error("ID is missing!");
        }

        if (!this.title) {
            throw new Meteor.Error("Title is missing!");
        }

        if (!this.position) {
            throw new Meteor.Error("Position is missing!");
        }

        if (!this.relevant_cities || this.relevant_cities.length == 0) {
            throw new Meteor.Error("Relevant city is missing!");
        }

        // Create a doc to save or update to the MongoDB database.
        var doc = {
            _id: this.id,
            owners: this.owners,
            relevant_cities: this.relevant_cities,
            title: this.title,
            description: this.description,
            popularity_score: this.popularity_score,
            position: this.position,
            start_time: this.start_time,
            stop_time: this.stop_time,
            image: this.image,
            venue: this.venue,
            url: this.url,
            price: this.price,
            categories: this.categories
        };

        // If this event already exists, then modify it.
        if (Events.find({_id: this.id}).count() > 0) {

            // If this event already exists, then make the owners and the relevant cities the union of
            // what already exists and the new information. THIS IS VERY IMPORTANT TO CATEGORIZE CITIES AND
            // KEEP TRACK OF SAVED EVENTS.
            let existingEvent = Events.findOne({_id: this.id});
            doc.owners = _.union(doc.owners, existingEvent.owners);
            doc.relevant_cities = _.union(doc.relevant_cities, existingEvent.relevant_cities);

            Events.update(this.id, {$set: doc},
                callback
            );
            // Else, create a new group.
        } else {
            // remember the context, since in callback it's changed
            var that = this;

            Events.insert(doc, function (error, result) {
                that._id = result;

                if (callback !== null) {
                    callback.call(that, error, result);
                }
            });
        }
    };

    remove(callback) {
        if (Events.find({_id: this.id}).count() > 0)
            Events.remove(this.id, callback);
        else
            callback.call(this);
    }
};

Events.before.insert(function (userId, doc) {
    let now = new Date();
    doc.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
    Logger.debug('Inserting event %s', doc._id);
});

Events.before.update(function (userId, doc, fieldNames, modifier, options) {
    let now = new Date();
    modifier.$set = modifier.$set || {};
    modifier.$set.expires = new Date(now.getTime() + (3600000 * (Meteor.settings.hoursEventsExpiresIn || 24)));
    Logger.debug('Updating event %s', doc._id);
});

Events.before.remove(function (userId, doc) {
    Logger.debug('Removing event %s', doc._id, {expires: doc.expires});
});
