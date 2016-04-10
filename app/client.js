import 'imports/collections/Event';
import 'imports/collections/PreferenceSet';
import 'imports/collections/Category';
import 'scriptjs';

import './routes';

if (typeof window !== 'undefined') {
  /*eslint-disable */
  window.JOB_QUEUE = JobCollection('fundoQueue');
  /*eslint-enable */
}