import Event from 'App/collections/Event';
import _ from 'lodash';

import EventCarousel from './EventCarousel';


export default class TopEventsCarousel extends EventCarousel {
    getMeteorData() {
        if (this.state.loading) {
            Meteor.subscribe('events', new Date(), null, this.props.searchValue, {
                onReady: function () {
                    if (this.state.loading)
                        this.setState({loading: false});
                }.bind(this)
            });
        }

        let events = Event.getCollection().find(
            {
                likes: {
                    $nin: [Meteor.userId()]
                },
                dislikes: {
                    $nin: [Meteor.userId()]
                }
            },
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
}