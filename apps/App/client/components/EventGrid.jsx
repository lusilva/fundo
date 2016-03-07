/* global React, Meteor */

import GridEvent from './GridEvent';

import Alert from 'react-s-alert';
import _ from 'lodash';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';

/**
 * The grid view of all the events at the bottom of the dashboard.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class EventGrid extends React.Component {

    static propTypes = {
        events: React.PropTypes.array.isRequired,
        preferences: React.PropTypes.object
    };

    state = {
        eventsSet: {},
        preferences: null
    };


    /** @inheritDoc */
    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.preferences, this.state.preferences)) {
            this.setState({preferences: nextProps.preferences});
        }
        if (!_.isEqual(nextProps.events, this.state.events)) {
            this._updateEventsSet(nextProps.events);
        }
    };

    componentWillUnmount() {
        this.resetEvents();
    };


    /**
     * Resets the event set, removing all events.
     */
    resetEvents() {
        this.setState({eventsSet: {}});
    };


    /**
     * Updates the hashed set of events and prevents duplicates from showing.
     *
     * @param newEvents - The array of new events to add to the DOM.
     * @private
     */
    _updateEventsSet(newEvents) {
        let newEventsSet = this.state.eventsSet;

        if (!this.state.preferences || !this.state.preferences.location) {
            this.resetEvents();
            return;
        }

        // Remove all events where city does not correspond with current city.
        _.each(_.keys(newEventsSet), function (key) {
            let event = newEventsSet[key];
            if (!_.includes(event.relevant_cities, this.state.preferences.location)) {
                delete newEventsSet[key];
            }
        }.bind(this));

        // Add all new events.
        _.each(newEvents, function (event) {
            if (!_.has(newEventsSet, event.id) &&
                _.includes(event.relevant_cities, this.state.preferences.location)) {
                newEventsSet[event.id] = event;
            }
        }.bind(this));

        // Finally, update the state.
        this.setState({eventsSet: newEventsSet});
    };


    /** @inheritDoc */
    render() {
        return (
            <div className="ui container">
                <div className="ui doubling four column grid">
                    {_.map(_.values(this.state.eventsSet), function (event) {
                        return (
                            <GridEvent key={event.id}
                                       event={event}/>);
                    })}
                </div>
            </div>
        )
    }

}