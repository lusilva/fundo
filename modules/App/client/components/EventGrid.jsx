/* global React, Meteor */

import GridEvent from './GridEvent';
import Alert from 'react-s-alert';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';

import ReactShuffle from "react-shuffle";

/**
 * The grid view of all the events at the bottom of the dashboard.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class EventGrid extends React.Component {

    static propTypes = {
        events: React.PropTypes.array.isRequired
    };

    state = {
        eventsSet: []
    };

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.events, this.state.events)) {
            this._updateEventsSet(nextProps.events);
        }
    };

    resetEvents() {
        this.setState({eventSet: []});
    };

    _updateEventsSet(newEvents) {
        let events = [];
        _.each(newEvents, function (event) {
            if (!_.contains(this.state.eventsSet, event)) {
                events.push(event);
            }
        }.bind(this));
        this.setState({eventsSet: events});
    };

    /** @inheritDoc */
    render() {
        return (
            <div className="ui container">
                <div className="ui cards">
                    {_.map(this.state.eventsSet, function (event) {
                        return (<GridEvent key={event.id} event={event}/>);
                    })}
                </div>
            </div>
        )
    }

}