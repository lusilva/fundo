import PreferenceSet from 'App/collections/PreferenceSet';

Meteor.publish('userpreferences', function() {
    return PreferenceSet.getCollection().find({userId: this.userId});
});