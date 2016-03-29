import Event from 'App/collections/Event';
import _ from 'lodash';

import EventCarousel from './EventCarousel';


export default class TopEventsCarousel extends EventCarousel {
    getMeteorData() {
        Meteor.subscribe('events', new Date(), null, this.props.searchValue, {
            onReady: function () {
                if (this.state.loading)
                    this.setState({loading: false, reactive: false});
            }.bind(this)
        });

        let events = Event.getCollection().find(
            {},
            {
                // Assert limit and sorting for the events.
                limit: 25,
                sort: {
                    like_count: -1,
                    dislike_count: 1,
                    popularity_score: -1
                },
                reactive: false
            }
        ).fetch();

        return {events}
    };
}