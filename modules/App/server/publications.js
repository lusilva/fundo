import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';
import Category from 'App/collections/Category';

// Publish only the preferences for the current user.
Meteor.publish('userpreferences', function () {
    return PreferenceSet.getCollection().find({userId: this.userId});
});

// Publish all categories.
Meteor.publish('categories', function () {
    return Category.getCollection().find(
        {},
        {
            sort: {
                name: 1
            }
        });
});

// Publish events.
// TODO: move like and dislike to server side, so that we can implement all filters here.
Meteor.publish('events', function (limit, currentDate, city) {
    if (this.userId) {
        var dl = limit || 10;
        return Event.getCollection().find(
            {
                // Get events in the user's city.
                relevant_cities: {
                    $in: [city]
                },
                // Get events that have not yet started.
                start_time: {
                    $gte: new Date(currentDate)
                }
            },
            {
                // Assert limit and sorting for the events.
                limit: dl,
                sort: {
                    like_count: -1,
                    //dislike_count: 1,
                    popularity_score: -1
                }
            }
        );
    }
    return null;
});