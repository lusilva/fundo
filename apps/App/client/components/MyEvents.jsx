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
@ReactMixin.decorate(PureRenderMixin)
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
        limit: 20
    };

    subs = [];


    /**
     * Function that runs automatically everytime the data that its subscribed to changes.
     * In this case, it provides the user preferences data. This is accessible in the rest of the
     * component through this.data.savedEvents.
     *
     */
    getMeteorData() {
        this.subs.push(Meteor.subscribe('userpreferences'));

        // Find the preference set for the current user.
        let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

        // Subscribe to events.
        this.subs.push(Meteor.subscribe('savedevents', this.state.limit, new Date()));

        // Get events from the database.
        let savedEvents = Event.getCollection().find().fetch();


        // Return the preference and the user's events. This is available in this.data.
        return {savedEvents, preferences}
    };

    /** @inheritDoc */
    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);


        $(rootNode).find('.main-saved-events-content')
            .visibility({
                once: false,
                // update size when new content loads
                observeChanges: true,
                // load content on bottom edge visible
                onBottomVisible: this._loadMoreEvents.bind(this)
            });
    };


    /** @inheritDoc */
    componentWillUnmount() {
        _.each(this.subs, function (sub) {
            sub.stop();
        });
    };


    /**
     * Loads more events from the database, called when a user scrolls to the bottom of the page.
     *
     * @private
     */
    _loadMoreEvents() {
        this.setState({limit: Math.min(this.state.limit + 20, 100)});
    };


    /** @inheritDoc */
    render() {
        return (
            <div className="ui basic segment main-saved-events-content">
                <EventGrid events={this.data.savedEvents}
                           preferences={this.data.preferences}
                           ref="EventGrid"/>
            </div>

        )
    }
}