import 'imports/collections/Event';
import 'imports/collections/PreferenceSet';
import 'imports/collections/Category';
import 'scriptjs';

import './routes';

if (typeof window != 'undefined') {
  window.JOB_QUEUE = JobCollection('fundoQueue');
}