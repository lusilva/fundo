/* global React, ReactRouter, HomePage, App */

const {IndexRoute, Route} = ReactRouter;

AppRoutes = (
    <Route path="/" component={App}>
        <IndexRoute component={HomePage} />
    </Route>
);

ReactRouterSSR.Run(AppRoutes);