if ( Meteor.users.find().count() === 0 ) {
    Accounts.createUser({
        email: 'test@test.com',
        password: 'password'
    });
}