import TextTruncate from 'react-text-truncate';
import renderHTML from 'react-render-html';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';
import _ from 'lodash';

import BaseEvent from './BaseEvent';
import DetailedEvent from './DetailedEvent';

@ReactMixin.decorate(PureRenderMixin)
export default class FeaturedEvent extends BaseEvent {

  componentDidMount() {
    let rootNode = ReactDOM.findDOMNode(this);

    $(rootNode).find('.ui.modal.event-details')
      .modal('setting', 'transition', 'horizontal flip')
      .modal('attach events', $(rootNode).find(".more-info-button"), 'show');
  };


  render() {

    let event = this.props.event;

    //TODO: change this to be placeholder image based on category.
    let eventImage = require("../../img/fundo-default-event-img.png");
    // First check if event has a medium image, if not then check if it has a large image.
    if (event.image && event.image.large) {
      eventImage = event.image.large.url;
    } else if (event.image && event.image.medium) {
      eventImage = event.image.medium.url;
    }


    // Format the start and end time using moment.js
    let time = event.start_time ? moment(event.start_time) : "unknown time";
    if (event.start_time && event.stop_time) {
      time = time.twix(event.stop_time);
    }

    return (
      <div className="ui fluid card featured-event">
        <div className="content">
          <img className="right floated tiny ui image"
               src={eventImage}/>
          <div className="header">
            <TextTruncate
              line={1}
              truncateText="…"
              text={event.title}
              showTitle={false}/>
          </div>
          <div className="meta">
            <div className="date">
              {event.stop_time ? time.format() : time.format('MMM Do, h:mm a')}
            </div>
          </div>
        </div>
        <div className="content">
          <div className="meta">
            {this._getDislikes()}
            {this._getLikes()}
          </div>
        </div>
        <div className="ui bottom attached primary button more-info-button">
          More Info
        </div>
        <DetailedEvent event={event}/>
      </div>
    )
  }
};