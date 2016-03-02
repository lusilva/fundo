// Create Preference collection
import Event from './Event';
import{ updateAllEventsForCity } from 'App/server/cache/refresh';
import Logger from 'App/logger';


const PreferenceSets = new Meteor.Collection("preferencesets", {
    transform: function (doc) {
        return new PreferenceSet(
            doc._id,
            doc.userId,
            doc.indices,
            doc.location
        );
    }
});

// Preference class constructor
export default class PreferenceSet {

    constructor(aId,
                aUserId,
                aIndices,
                aLocation) {

        this._id = aId;
        // Make the ID for the current user if no userId is defined.
        if (!aUserId) {
            aUserId = Meteor.userId();
        }
        this._userId = aUserId;
        this._indices = aIndices;
        if (!this._indices) {
            this._indices = [];
        }
        this._location = aLocation;
    };

    get id() {
        return this._id;
    };

    get user() {
        return this._userId;
    };

    get indices() {
        return this._indices;
    };

    get location() {
        return this._location;
    };

    set location(location) {
        this._location = location;
    };

    static getCollection() {
        return PreferenceSets;
    };

    save(callback) {
        if (!this.user) {
            throw new Meteor.Error("User is not defined!");
        }

        if (!this.indices) {
            this._indices = [];
        }

        var doc = {
            userId: this.user,
            indices: this.indices,
            location: this.location
        };

        // If the preference object already exists, modify it
        if (this.id) {

            let existingSet = PreferenceSets.findOne({_id: this.id});

            // Check if location has changed.
            if (existingSet.location != this.location) {

                // If there are no events for this city, then fetch some.
                let eventsAlreadyExistForNewLocation = Event.numEventsInCity(this.location) > 0;

                // If there are no events for this city yet, then fetch events for it.
                if (!eventsAlreadyExistForNewLocation) {

                    // Fetch more events for this city
                    updateAllEventsForCity(this.location);

                    // Add a cron job to automatically refresh this city every 24 hours.
                    SyncedCron.add({
                        name: 'eventful-' + this.location,
                        schedule: function (parser) {
                            // parser is a later.parse object
                            return parser.text(Meteor.settings.refreshEventsEvery || 'every 2 hours');
                        },
                        job: updateAllEventsForCity.bind(this, this.location)
                    });
                }

                // Check if the old city still has any users. If not, then remove the cron job for it, and remove
                // it from the list of relevant cities.
                if (existingSet.location && PreferenceSets.find({location: existingSet.location}).count() == 1) {
                    // Remove the cron job.
                    SyncedCron.remove('eventful-' + existingSet.location);

                    // Remove the old location from the list of relevant cities for events.
                    _.each(Event.findEventsInCity(existingSet.location).fetch(), function (event) {
                        let newRelevantCities = _.without(event.relevant_cities, existingSet.location);
                        if (newRelevantCities.length > 0) {
                            event.relevant_cities = newRelevantCities;
                            event.save(function (err, res) {
                                if (err) {
                                    Logger.error('error saving event %s', event.id, event, err);
                                }
                            });
                        } else {
                            event.remove(function (err, res) {
                                if (err) {
                                    Logger.error('error deleting event %s', event.id, event, err);
                                }
                            });
                        }
                    });
                }
            }

            PreferenceSets.update(this.id, {$set: _.omit(doc, '_id')}, callback);
            // Else create new
        } else {
            // Don't have to worry about location change here because PreferenceSets are only
            // created once per user, right after user creation. The location is initially null.
            var that = this;
            PreferenceSets.insert(doc, function (error, result) {
                that._id = result;
                if (callback != null) {
                    callback.call(that, error, result);
                }
            });
        }
    };

    resetPreference(category) {
        for (var i = 0; i < this.indices.length; ++i) {
            if (this.indices[i].category == category) {
                this.indices[i].index = 0;
                this.indices[i].count = 0;
            }
        }
    };

    // Update the user's preference set for the given category
    updatePreference(category, value) {
        // If index already exists for this category, find it and update it
        // appropriately
        for (var i = 0; i < this._indices.length; i++) {
            if (this._indices[i].category == category) {
                this._indices[i].index =
                    (this._indices[i].index * this._indices[i].count + value) /
                    (this._indices[i].count + 1);
                this._indices[i].count += 1;

                return true;
            }
        }

        // Otherwise, create new index with the value
        var newIndex = {
            category: category,
            index: value,
            count: 1
        };
        this._indices.push(newIndex);

        return false;
    };

    // Get a matching score between the set of categories and the preference
    // set
    getMatchingScore(categories) {
        // Calculate top half of cosine similarity equation
        var top = 0;
        // Not super efficient
        var that = this;
        categories.forEach(function (category) {
            for (var i = 0; i < that._indices.length; i++) {
                if (that._indices[i].category == category) {
                    if (that._indices[i].index > 0 || that._indices[i].count > 2) {
                        top += that._indices[i].index * Math.log(that._indices[i].count);
                    }
                    break;
                }
            }
        });

        // Calculate preference set 2-norm
        var sum = 0;
        for (var i = 0; i < this._indices.length; i++) {
            sum += this._indices[i].index * this._indices[i].index;
        }
        var preference2Norm = Math.sqrt(sum);

        // Calculate event 2-norm (equivalent to sqrt of category length since
        // these are all just 1 values)
        var event2Norm = Math.sqrt(categories.length);

        // Return score
        return top / (preference2Norm * event2Norm);
    };

    setIndex(category, index) {
        for (var i = 0; i < this._indices.length; i++) {
            if (this._indices[i].category == category) {
                this._indices[i].index = index;
                return;
            }
        }

        // If not preexisting
        this._indices.push({
            category: category,
            index: index,
            count: 0
        });
    };
}

PreferenceSets.allow({
    insert: function (userId, doc) {
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        return userId == doc.userId;
    },
    remove: function (userId, doc) {
        return false;
    },
    fetch: ["userId"]
});
