/* global React, Meteor, ReactMeteorData */

import Event from 'App/collections/Event';
import PreferenceSet from 'App/collections/PreferenceSet';

import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import EventGrid from './EventGrid';


/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(ReactMeteorData)
export default class Dashboard extends React.Component {

    /**
     * The props that this component expects.
     *
     * @type {{currentUser: *}}
     */
    static propTypes = {
        currentUser: React.PropTypes.object
    };

    state = {
        loading: true
    };

    eventSub = null;


    /**
     * Function that runs automatically everytime the data that its subscribed to changes.
     * In this case, it provides the user preferences data. This is accessible in the rest of the
     * component through this.data.savedEvents.
     *
     */
    getMeteorData() {
        this.eventSub = Meteor.subscribe('savedevents', this.state.limit, new Date(), {
            onReady: function () {
                this.setState({loading: false});
            }.bind(this)
        });

        // Get events from the database.
        let savedEvents = Event.getCollection().find(
            {},
            {
                // Assert limit and sorting for the events.
                limit: this.state.limit,
                sort: {
                    start_time: 1
                },
                reactive: false
            }
        ).fetch();

        // Return the preference and the user's events. This is available in this.data.
        return {savedEvents}
    };


    /** @inheritDoc */
    componentWillUnmount() {
        if (this.eventSub) {
            this.eventSub.stop();
        }
    };


    /** @inheritDoc */
    render() {

        let content = this.state.loading ?
            (
                <div className="ui active inverted dimmer">
                    <div className="ui text large loader">Loading Your Events</div>
                </div>

            ) :
            (
                <EventGrid events={this.data.savedEvents}/>
            );

        return (
            <div className="ui basic segment main-saved-events-content">
                {content}
            </div>
        )
    }
}