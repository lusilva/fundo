import Logger from 'App/logger';

// Create Events MongoDB collection
const Events = new Meteor.Collection("events", {
    transform: function (doc) {
        return new Event(doc);
    }
});

// A Event class that takes a document in its constructor
export default class Event {

    constructor(doc) {
        this._id = doc._id;
        this._relevant_cities = doc.relevant_cities;
        this._owners = doc.owners || [];
        this._title = doc.title;
        this._description = doc.description;
        this._popularity_score = doc.popularity_score;
        this._position = doc.position;
        this._start_time = doc.start_time;
        this._stop_time = doc.stop_time;
        this._image = doc.image;
        this._venue = doc.venue;
        this._links = doc.links;
        this._url = doc.url;
        this._price = doc.price;
        this._categories = doc.categories;
        this._tickets = doc.tickets;
        this._likes = doc.likes || [];
        this._dislikes = doc.dislikes || [];

        // Needed in order to sort events by number of likes.
        this._like_count = this._likes.length;
        this._dislike_count = this._dislikes.length;
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

    get links() {
        return this._links;
    };

    get likes() {
        return this._likes;
    };

    get dislikes() {
        return this._dislikes;
    };

    get tickets() {
        return this._tickets;
    }

    set likes(likes) {
        this._likes = likes;
    };

    set dislikes(dislikes) {
        this._dislikes = dislikes;
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

    like(callback) {
        if (!Meteor.userId()) {
            callback(new Meteor.Error('user not valid!'), null);
        }

        if (_.contains(this.likes, Meteor.userId())) {
            callback(null, this.id);
        }

        let likes = [Meteor.userId()];

        this.likes = _.union(likes, this.likes);

        Meteor.call("like", this.id, function (err, res) {
            if (!err) {
                this.save(callback);
            } else {
                callback(err, res);
            }
        }.bind(this));
    };

    unlike(callback) {
        if (!Meteor.userId()) {
            callback(new Meteor.Error('user not valid!'), null);
        }

        if (!_.contains(this.likes, Meteor.userId())) {
            callback(null, this.id);
        }

        this.likes = _.without(this.likes, Meteor.userId());

        Meteor.call("unlike", this.id, function (err, res) {
            if (!err) {
                this.save(callback);
            } else {
                callback(err, res);
            }
        }.bind(this));
    };

    dislike(callback) {
        if (!Meteor.userId()) {
            callback(new Meteor.Error('user not valid!'), null);
        }

        if (_.contains(this.dislikes, Meteor.userId()) ||
            _.contains(this.likes, Meteor.userId())) {
            callback(null, this.id);
        }

        let dislikes = [Meteor.userId()];

        this.dislikes = _.union(dislikes, this.dislikes);

        Meteor.call("dislike", this.id, function (err, res) {
            if (!err) {
                this.save(callback);
            } else {
                callback(err, res);
            }
        }.bind(this));
    };

    undislike(callback) {
        if (!Meteor.userId()) {
            callback(new Meteor.Error('user not valid!'), null);
        }

        if (!_.contains(this.dislikes, Meteor.userId())) {
            callback(null, this.id);
        }

        this.dislikes = _.without(this.dislikes, Meteor.userId());

        Meteor.call("undislike", this.id, function (err, res) {
            if (!err) {
                this.save(callback);
            } else {
                callback(err, res);
            }
        }.bind(this));
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
            tickets: this.tickets,
            url: this.url,
            price: this.price,
            categories: this.categories,
            links: this.links,
            likes: this.likes,
            dislikes: this.dislikes,

            like_count: this.likes.length,
            dislike_count: this.dislikes.length
        };

        // If this event already exists, then modify it.
        if (Events.find({_id: this.id}).count() > 0) {
            Events.update(this.id, {$set: _.omit(doc, '_id')},
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


Events.allow({
    insert: function (userId, doc) {
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        // TODO: Make sure only likes and dislikes fields can be modified for security.
        return userId;
    },
    remove: function (userId, doc) {
        return false;
    },
    fetch: ["userId"]
});
