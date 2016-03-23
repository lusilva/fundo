import 'App/collections/Event';
import 'App/collections/PreferenceSet';
import 'App/collections/Category';

import './routes';


$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
};
