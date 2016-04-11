/* global React, Meteor */

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import _ from 'lodash';

import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import Event from 'imports/collections/Event';
import GridEvent from '../events/GridEvent';

/**
 * Represents the featured events shown at the top of the page.
 *
 * @className
 * @extends React.Component
 *
 */
@ReactMixin.decorate(PureRenderMixin)
export default class EventCarousel extends React.Component {

  static propTypes = {
    category: React.PropTypes.object.isRequired,
    sizes: React.PropTypes.object.isRequired,
    city: React.PropTypes.string.isRequired
  };

  state = {
    events: null
  };

  sub = null;

  componentDidMount() {
    if (!this.state.events) {
      _.defer(this._setEvents.bind(this));
    }
  };

  _setEvents() {
    if (!this.sub || !this.sub.ready() && !this.state.events) {
      this.sub = Meteor.subscribe('events', this.props.category.name, {
        onReady: function() {
          if (!this.state.events) {
            this._setEvents();
          }
        }.bind(this)
      });
    }

    if (this.state.events) {
      return;
    }

    let events = Event.getCollection().find(
      {
        categories: {
          $in: [this.props.category.name]
        },
        likes: {
          $nin: [Meteor.userId()]
        },
        dislikes: {
          $nin: [Meteor.userId()]
        }
      },
      {
        // Assert limit and sorting for the events.
        sort: {
          start_time: 1
        },
        reactive: false
      }
    ).fetch();

    this.setState({events: events});
  };


  render() {
    let sizes = this.props.sizes;

    if (!this.state.events) {
      return (
        <div className="ui container">
          <div className="ui active centered inline text loader carousel-loader">
            Loading {this.props.category.name}
          </div>
        </div>
      )
    }

    let enoughEvents = this.state.events.length >= sizes.large;

    let settings = {
      infinite: false,
      autoplay: false,
      speed: 500,
      slidesToShow: sizes.large,
      slidesToScroll: Math.min(sizes.large, this.state.events ? this.state.events.length : sizes.large),
      centerMode: false,
      draggable: enoughEvents,
      arrows: this.state.events.length > sizes.large,
      dots: false,
      lazyLoad: enoughEvents,
      responsive: [{
        breakpoint: 728,
        settings: {
          slidesToShow: Math.min(sizes.medium, this.state.events ? this.state.events.length : sizes.medium),
          slidesToScroll: Math.min(sizes.medium, this.state.events ? this.state.events.length : sizes.medium),
          arrows: this.state.events.length > sizes.medium
        }
      }, {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(sizes.small, this.state.events ? this.state.events.length : sizes.small),
          slidesToScroll: Math.min(sizes.small, this.state.events ? this.state.events.length : sizes.small),
          arrows: this.state.events.length > sizes.small
        }
      }]
    };

    let that = this;

    let slider = this.state.events && this.state.events.length > 0 ? (
      <div>
        <h1 className="ui left floated header">{this.props.category.name} ({this.state.events.length})</h1>
        <div className="ui clearing divider"></div>
        <Slider {...settings}>
          {_.map(this.state.events, function(event) {
            return (
              <div key={that.props.category.category_id + '-' + event.id + '-' + 'event-carousel'}>
                <GridEvent event={event}/>
              </div>
            );
          })}
        </Slider>
      </div>
    ) : null;

    return (
      <div className="ui container">
        {slider}
      </div>
    )
  }
}