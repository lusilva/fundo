import 'App/collections/Event';
import 'App/collections/PreferenceSet';
import 'App/collections/Category';
import 'scriptjs';

import './routes';

if (typeof window != 'undefined') {
    window.JOB_QUEUE = JobCollection('fundoQueue');
}