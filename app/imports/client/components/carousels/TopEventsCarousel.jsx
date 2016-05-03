import _ from 'lodash';

import Event from 'imports/collections/Event';
import EventCarousel from './EventCarousel';

export default class TopEventsCarousel extends EventCarousel {

  _setEvents() {
    if (!this.sub || !this.sub.ready()) {
      this.sub = Meteor.subscribe('events', null, {
        onReady: function() {
          if (!this.state.events || this.state.events.length == 0) {
            this._setEvents();
          }
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
        },
        // Get events in the user's city.
        relevant_cities: {
          $in: [this.props.city]
        },
        start_time: {
          $gt: new Date()
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

    this.setState({events: events});
  };
}