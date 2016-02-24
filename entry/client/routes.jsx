import { Route } from 'react-router';

import Routes from 'App/client/routes'

// Run in production to activate server side rendering.
ReactRouterSSR.Run(
    <Route>
        {Routes}
    </Route>
);
