/* global React, Meteor, ReactMeteorData */

import Event from 'App/collections/Event';
import PreferenceSet from 'App/collections/PreferenceSet';

import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import EventGrid from './EventGrid';


/**
 * The MyEvents view displaying the user's liked events.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(ReactMeteorData)
@ReactMixin.decorate(PureRenderMixin)
export default class MyEvents extends React.Component {

    /**
     * The props that this component expects.
     *
     * @type {{currentUser: *}}
     */
    static propTypes = {
        currentUser: React.PropTypes.object
    };

    state = {
        loading: false
    };


    /**
     * Function that runs automatically everytime the data that its subscribed to changes.
     * In this case, it provides the user preferences data. This is accessible in the rest of the
     * component through this.data.savedEvents.
     *
     */
    getMeteorData() {
        Meteor.subscribe('savedevents');
        // Get events from the database.
        let savedEvents = Event.getCollection().find(
            {
                likes: {
                    $in: [Meteor.userId()]
                }
            },
            {
                // Assert limit and sorting for the events.
                sort: {
                    start_time: 1
                }
            }
        ).fetch();

        // Return the preference and the user's events. This is available in this.data.
        return {savedEvents}
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