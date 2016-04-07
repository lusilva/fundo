var id;

try {
    let user = {
        email: Meteor.settings.admin.email,
        password: Meteor.settings.admin.password,
        name: 'Admin User',
        roles: ['admin']
    };
    if (Meteor.users.find({"emails.address": user.email}, {limit: 1}).count() == 0) {
        id = Accounts.createUser({
            email: user.email,
            password: user.password,
            profile: {name: user.name}
        });

        if (user.roles.length > 0) {
            // Need _id of existing user record so this call must come
            // after `Accounts.createUser` or `Accounts.onCreate`
            Roles.addUsersToRoles(id, user.roles, 'default-group');
        }
    }
} catch (e) {
    console.log(e);
}