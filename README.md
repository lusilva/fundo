# fundo
#### Find nearby events that interest you without getting bogged down by those who don't. 

This is a project for RCOS (Rensselaer Center for Open Source), built with Meteor and React.

### Description
fundo is a web application which will allow users to discover nearby events. It's main focus is on being an event discovery tool, and the plan is for it to be tinder-like. Users will be able to upvote and like events, and the system will learn user preferences and recommend nearby events that the user is likely to attend. In time, the event suggestions should improve as users provide more data points for the recommendation algorithm. We will also recommend events to users based on what other users with similar preferences have also liked. The goal of this project is to create a one-stop shop to find something to do if you’re bored, and only provide events that users are interested in attending.

### Timeline
- [x] Week 1-2: Finalize app design. Look into recommendation algorithms and get complete feature list of what we want to implement. 

- [x] Weeks 3-4: Rough app skeleton, integrate event APIs to draw event data from. Implement event cache and figure out how to manage the data.

- [ ] Weeks 5-6: Play around with recommendation systems. Improve app infrastructure. Test recommendations using mock users with different preferences.

- [ ] Weeks 7-8: Implement bulk of recommendation system. Plug into recommendation apis and figure out how to parse events to extract important/relevant data.

- [ ] Weeks 9-10: Get a working frontend up. Fix backend issues, continued development. Fine tune recommendations.

- [ ] Week 11: Squash dem bugs by thoroughly testing features. Continued work on frontend features and backend recommendations. Possibly look at more apis to plug into.

- [ ] Week 12: Release to the public. Be happy.


### The stack & features
- ES6 modules
- Meteor
- React.js
- react-router with server-rendering (you can disable it by editing `server/entry.js`)
- Webpack (bundle your app / assets and send them to Meteor)
- Hot-reload with no page refresh in development mode
- Optimize your code in production mode
- Give access to NPM by using packages.json

### Build Instructions

1. Install [Meteor](https://www.meteor.com/install)
2. Create settings.json file in the root directory.
   More info [here.](http://docs.meteor.com/#/full/meteor_settings)
3. Run `meteor run --settings settings.json`, which will install all dependencies and start up the meteor server.
4. Go to `localhost:3000` in your web browser.


### Example settings.json
    
        {
            "kadira": {
                "appId": <KADIRA_APP_KEY_GOES_HERE>,
                "appSecret": <KADIRA_SECRET_KEY_GOES_HERE>,
                "debug": {
                "authKey": <KADIRA_AUTH_KEY_GOES_HERE>
                }
            },
            "testUser": {
                "email": <EXAMPLE EMAIL ADDRESS (eg "test@test.com")>,
                "password": <EXAMPLE PASSWORD (eg "testpassword")>
            },
            "debugEnabled": <true OR false>,
            "eventfulAPIKey": <EVENTFUL_API_KEY_GOES_HERE>,
            "maxPagesPerCity": <NUMBER>,
            "hoursEventsExpiresIn": <NUMBER>,
            "refreshEventsEvery": <STRING (eg "every 2 hours")>
        }

#### Run in production mode (with SSR enabled)
`meteor run --production --settings settings.json`

#### Build for production
`meteor build .`


##### A little note about SSR
This application uses SSR (Server Side Rendering) in production. Therefore, all code that relies on the global `window` object in any view must be wrapped in a conditional such as `if (typeof window != 'undefined') { code block } `, since `window` exists only on the browser and not on the server. This does not apply to code inside functions that are only run on the browser, such as `componentDidMount`.


Thanks to [thereactivestack's kickstart project](https://github.com/thereactivestack/kickstart-simple), which this project is based upon.
