if ( Meteor.users.find().count() === 0 && Meteor.settings.testUser ) {
    Accounts.createUser({
        email: Meteor.settings.testUser.email,
        password: Meteor.settings.testUser.password
    });
    Meteor.users.update(Meteor.users.findOne()._id, {$set: {"emails.0.verified" :true}});
}