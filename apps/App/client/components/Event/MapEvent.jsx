/* global Meteor, React */

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
export default class MapEvent extends BaseEvent {

    /** @inheritDoc */
    componentDidMount() {
        let rootNode = ReactDOM.findDOMNode(this);

        this.setState({
            liked: _.includes(this.props.event.likes, Meteor.userId()),
            disliked: _.includes(this.props.event.dislikes, Meteor.userId())
        });
    };

    /** @inheritDoc */
    render() {
        let event = this.props.event;

        // Format the start and end time using moment.js
        let time = event.start_time ? moment(event.start_time) : null;
        if (event.start_time && event.stop_time) {
            time = time.twix(event.stop_time);
        }

        // Get the venue information, doing all necessary null checking.
        let venueName = event.venue && event.venue.name ? event.venue.name : "unknown venue";

        let formattedTime = time && event.stop_time ? time.format() : (time ? time.format('MMM Do, h:mm a') : 'unknown time');
        if (!formattedTime || formattedTime.length == 0) {
            formattedTime = moment(event.start_time).format('MMM Do, h:mm a')
        }

        return (
            <div className="ui card">
                <div className="ui content">
                    <div className="container header event-title" data-content={event.title}>
                        {event.title}
                    </div>
                </div>
                <div className="content">
                    <div className="header">
                        {venueName}
                    </div>
                    <div className="meta">
                            <span className="date">
                                {formattedTime}
                            </span>
                    </div>
                    <div className="meta">
                        {this._getDislikes()}
                        {this._getLikes()}
                    </div>
                </div>
            </div>
        );
    };
}