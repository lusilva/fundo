
Meteor.methods({
    "log": function(level, logArguments) {
        logArguments.unshift(level);
        if (Meteor.isServer)
            Winston.log.apply(this, logArguments);
    },
    "resendEmailVerification": function() {
        Accounts.sendVerificationEmail(Meteor.userId());
    }
});