import { Route, IndexRoute } from 'react-router';

import Layout from './Layout';
import Home from './components/Home';
import Login from './components/Login';

export default (
    <Route path="/" component={Layout}>
        <IndexRoute component={Home}/>
        <Route path="/login" component={Login}/>
    </Route>
);
