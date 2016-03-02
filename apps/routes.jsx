import { Route } from 'react-router';
import { ReactRouterSSR } from 'meteor/reactrouter:react-router-ssr';
import Routes from 'App/client/routes';

ReactRouterSSR.Run(
    <Route>
        {Routes}
    </Route>
);
