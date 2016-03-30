import Event from 'App/collections/Event';
import _ from 'lodash';

import EventCarousel from './EventCarousel';


export default class TopEventsCarousel extends EventCarousel {

    state = {
        loading: Event.getCollection().find({}, {reactive: false}).count() == 0
    };

    getMeteorData() {
        if (this.state.loading) {
            Meteor.subscribe('events', new Date(), null, this.props.searchValue, {
                onReady: function () {
                    if (this.state.loading)
                        this.setState({loading: false, reactive: false});
                }.bind(this)
            });
        }

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

        events = !this.data.events || events.length > this.data.events ? events : this.data.events;
        return {events}
    };

    componentDidMount() {
        if (this.state.loading && Event.getCollection().find({}, {reactive: false}).count() > 0)
            this.setState({loading: false});
    };
}