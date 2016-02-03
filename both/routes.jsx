/* global React, ReactRouter, Home, Layout */

const {IndexRoute, Route} = ReactRouter;

AppRoutes = (
    <Route path="/" component={Layout}>
        <IndexRoute component={Home} />
    </Route>
);

ReactRouterSSR.Run(AppRoutes);