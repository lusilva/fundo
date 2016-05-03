/* global Meteor AccountsEvents */
/**
 * This file runs at startup, and has a special name. It contains all of the
 * accounts configurations for the built-in user package. This provides
 * user authentication.x
 */

if (Meteor.isClient)
  AccountsEvents = new EventEmitter();

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
  continuousValidation: false,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,

  // Privacy Policy and Terms of Use
  //privacyUrl: 'privacy',
  //termsUrl: 'terms-of-use',

  // Redirects
  //homeRoutePath: '/dashboard',
  //redirectTimeout: 4000,

  // Hooks
  //onLogoutHook: myLogoutFunc,
  onSubmitHook: function(err, state) {
    if (!err && Meteor.isClient && state !== 'changePwd') {
      AccountsEvents.emit('loggedIn');
    }
    return true;
  },
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


if (Meteor.settings.mail) {
  process.env.MAIL_URL = 'smtp://' +
    encodeURIComponent(Meteor.settings.mail.username) + ':' +
    encodeURIComponent(Meteor.settings.mail.password) + '@' +
    encodeURIComponent(Meteor.settings.mail.server) + ':' + Meteor.settings.mail.port;
}