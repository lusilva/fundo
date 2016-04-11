/* global Meteor, React */

import TextTruncate from 'react-text-truncate';
import parseLink from 'parse-link';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';
import renderHTML from 'react-render-html';
import _ from 'lodash';

import BaseEvent from './BaseEvent';

/**
 * The view component for an event card.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class DetailedEvent extends BaseEvent {

  /** @inheritDoc */
  render() {
    let event = this.props.event;

    // Format the start and end time using moment.js
    let time = event.start_time ? moment(event.start_time) : null;
    if (event.start_time && event.stop_time) {
      time = time.twix(event.stop_time);
    }

    //TODO: change this to be placeholder image based on category.
    // let eventImage = "http://semantic-ui.com/images/avatar/large/elliot.jpg";
    let eventImage = require("../../img/fundo-default-event-img.png");
    // First check if event has a medium image, if not then check if it has a large image.
    if (event.image && event.image.large) {
      eventImage = event.image.large.url;
    } else if (event.image && event.image.medium) {
      eventImage = event.image.medium.url;
    }

    // Get the venue information, doing all necessary null checking.
    let venueName = event.venue && event.venue.name ? event.venue.name : "unknown venue";
    let venueAddress = event.venue && event.venue.address ? event.venue.address : "unknown address";

    let formattedTime = time && event.stop_time ? time.format() : (time ? time.format('MMM Do, h:mm a') : 'unknown time');
    if (!formattedTime || formattedTime.length == 0) {
      formattedTime = moment(event.start_time).format('MMM Do, h:mm a')
    }

    return (
      <div className="ui modal event-details">
        <i className="close icon"/>
        <div className="header">
          {event.title}
        </div>
        <br/>
        <div className="ui grid container">
          <div className="ui content four wide column">
            <div className="ui fluid image">
              <img src={eventImage}/>
            </div>
            <div className="eventful-badge eventful-small">
              <img src="http://api.eventful.com/images/powered/eventful_58x20.gif"
                   alt="Local Events, Concerts, Tickets"
              />
              <p><a href="http://eventful.com/">Events</a> by Eventful</p>
            </div>
          </div>
          <div className="ui content twelve wide column">
            <h4 className="ui ui horizontal section divider hidden">Description</h4>
            <div className="description">
              {renderHTML(event.description || "No Description Available")}
            </div>
            <div className="ui horizontal section divider"></div>

            <div className="ui two column grid">
              <div className="column">
                <h4 className="ui horizontal section divider header">
                  <i className="home icon"/>
                  Venue
                </h4>
                <div className="description center">
                  <div className="date">
                    {formattedTime}
                  </div>
                  <a target="_blank" href={event.venue.url}>{venueName}, {venueAddress}</a>
                </div>
              </div>
              {this._getRelevantLinks()}
              {this._getTicketInfo()}
            </div>
          </div>
        </div>
        <br/>
      </div>
    );
  };
}