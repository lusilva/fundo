
Meteor.methods({
    "log": function(level, logArguments) {
        logArguments.unshift(level);
        if (Meteor.isServer)
            Winston.log.apply(this, logArguments);
    },
    "resendEmailVerification": function() {
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    "checkIfUserValid": function(callback) {
        if (!!Meteor.user() && Meteor.user().emails.length > 0)
            return Meteor.user().emails[0].verified;
        else
            return !!this.userId;
    }
});