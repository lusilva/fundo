/**
 * This file runs at startup, and has a special name. It contains all of the
 * accounts configurations for the built-in user package. This provides
 * user authentication.x
 */
AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: false,
    sendVerificationEmail: true,
    lowercaseUsername: false,
    focusFirstInput: true,
    enforceEmailVerification: false,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: false,
    showResendVerificationEmailLink: false,

    // Client-side Validation
    continuousValidation: true,
    negativeFeedback: true,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    //privacyUrl: 'privacy',
    //termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: '/',
    redirectTimeout: 4000,

    // Hooks
    //onLogoutHook: myLogoutFunc,
    //onSubmitHook: mySubmitFunc,
    //preSignUpHook: myPreSubmitFunc,
    //postSignUpHook: myPostSubmitFunc,

    // Texts
    texts: {
        button: {
            signIn: "Login",
            signUp: "Get Started"
        },
        //socialSignUp: "Register",
        //socialIcons: {
        //    "meteor-developer": "fa fa-rocket"
        //},
        title: {
            signUp: "Register",
            signIn: "Login",
            forgotPwd: "Recover Your Password"
        }
    }
});

if (Meteor.isClient) {
    /**
     * Verify emails and log users in when they click on a verify
     * email link.
     */
    Accounts.onEmailVerificationLink(function (token, done) {
        Accounts.verifyEmail(token, function (error) {
            if (!error) {
                Accounts.loginWithToken(token);
            }
            done();
            //TODO: show something if there was an error.
        });
    });
}