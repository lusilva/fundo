import {Route} from 'react-router';
import {ReactRouterSSR} from 'meteor/reactrouter:react-router-ssr';
import Routes from 'imports/client/routes';

/*eslint-disable */
ReactRouterSSR.Run(
  <Route>
    {Routes}
  </Route>
);
/*eslint-enable */
