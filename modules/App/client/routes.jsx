import { Route, IndexRoute } from 'react-router';

import Layout from './Layout';
import Home from './components/Home';

export default (
  <Route path="/" component={Layout}>
    <IndexRoute component={Home} />
  </Route>
);
