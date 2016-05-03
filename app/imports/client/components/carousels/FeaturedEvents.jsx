/* global React, Meteor */

import Event from 'imports/collections/Event';

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import FeaturedEvent from '../events/FeaturedEvent';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import _ from 'lodash';

import ReactMixin from 'react-mixin';

/**
 * Represents the featured events shown at the top of the page.
 *
 * @className
 * @extends React.Component
 *
 */
@ReactMixin.decorate(PureRenderMixin)
export default class FeaturedEvents extends React.Component {
  static propTypes = {
    city: React.PropTypes.string.isRequired
  };

  state = {
    events: null
  };

  sub = null;

  componentDidMount() {
    Meteor.call('getRecommendations', function(err, res) {
      if (err) {
        this._setEvents(null);
      } else {
        this._setEvents(res);
      }
    }.bind(this));
  };

  _setEvents(recommendedIds) {
    if ((!this.sub || !this.sub.ready()) && recommendedIds && recommendedIds.length > 0) {
      this.sub = Meteor.subscribe('recommendedIds', recommendedIds, {
        onReady: function() {
          if (!this.state.events) {
            this._setEvents(recommendedIds);
          }
        }.bind(this)
      });
    }

    if (this.state.events) {
      return;
    }

    let events = Event.getCollection().find(
      {
        _id: {
          $in: recommendedIds || []
        },
        start_time: {
          $gt: new Date()
        },
        // Get events in the user's city.
        relevant_cities: {
          $in: [this.props.city]
        }
      },
      {
        sort: {
          start_time: 1
        },
        reactive: false
      }
    ).fetch();

    this.setState({events: events});
  };

  render() {
    if (!this.state.events) {
      return (
        <div className="ui container">
          <div className="ui active inverted text large loader">Loading Recommendations</div>
        </div>
      );
    }

    let enoughEvents = !!this.state.events && this.state.events.length > 2;

    let settings = {
      infinite: true,
      speed: 500,
      slidesToShow: Math.min(3, this.state.events ? this.state.events.length : 3),
      centerMode: enoughEvents,
      draggable: enoughEvents,
      centerPadding: '20px',
      autoplay: enoughEvents,
      autoplaySpeed: 5000,
      pauseOnHover: true,
      dots: false,
      arrows: enoughEvents,
      lazyLoad: false,
      responsive: [{
        breakpoint: 728,
        settings: {
          slidesToShow: Math.min(2, this.state.events ? this.state.events.length : 2)
        }
      }, {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(1, this.state.events ? this.state.events.length : 1)
        }
      }]
    };

    let slider = this.state.events && this.state.events.length > 0 ? (
      <div className="featured-events">
        <h1 className="ui header inverted centered">Recommended Events</h1>
        <Slider {...settings}>
          {_.map(this.state.events, function(event) {
            return (
              <div key={'featured-' + event.id}>
                <div className={enoughEvents ? '' : 'featured-scaled-event'}>
                  <FeaturedEvent event={event}/>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    ) : (
      <div className="ui text container center aligned masthead-center">
        <h2>We currently don't have any recommended events for you. Let us know what events you like.</h2>
      </div>
    );

    return (
      <div className="ui container">
        {slider}
      </div>
    )
  }
}