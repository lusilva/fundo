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


// Publish saved events
Meteor.publish('savedevents', function (limit) {
    if (this.userId) {
        let dl = limit || 10;

        return Event.getCollection().find(
            {
                // Only show events that this user has liked.
                likes: {
                    $in: [this.userId]
                }
            },
            {
                // Assert limit and sorting for the events.
                limit: dl,
                sort: {
                    start_time: 1
                }
            }
        );
    } else {
        return null;
    }
});

// Publish events.
Meteor.publish('events', function (limit, currentDate) {
    if (this.userId) {
        let dl = limit || 10;
        let preferences = PreferenceSet.getCollection().findOne({userId: this.userId});

        return Event.getCollection().find(
            {
                // Get events in the user's city.
                relevant_cities: {
                    $in: [preferences.location]
                },
                // Get events that have not yet started.
                start_time: {
                    $gte: new Date(currentDate)
                },
                // Do not show events that this user has already liked.
                // These events should go in the 'My Events' page.
                likes: {
                    $nin: [this.userId]
                },
                // Do not show events that this user has already disliked.
                dislikes: {
                    $nin: [this.userId]
                }
            },
            {
                // Assert limit and sorting for the events.
                limit: dl,
                sort: {
                    like_count: -1,
                    dislike_count: 1,
                    popularity_score: -1
                }
            }
        );
    }
    return null;
});