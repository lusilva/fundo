/* global React, Meteor, ReactMeteorData */

import PreferenceSet from 'App/collections/PreferenceSet';
import Event from 'App/collections/Event';
import Category from 'App/collections/Category';

import Alert from 'react-s-alert';
import ReactMixin from 'react-mixin';
import _ from 'lodash';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

import { isUserVerified } from 'App/helpers';
import FeaturedEvents from './FeaturedEvents';
import EventGrid from './EventGrid';
import Filters from './Filters';


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


    /**
     * The state of the dashboard.
     *
     * @type {{filter: {open: boolean}, isSendingEmail: boolean, location: ?string}}
     */
    state = {
        filter: {
            open: false
        },
        isSendingEmail: false,
        location: null,
        loading: false,
        page: 1,
        totalPages: 1
    };

    eventSub = null;

    /**
     * Function that runs automatically every time the data that its subscribed to changes.
     * In this case, it provides the user preferences data. This is accessible in the rest of the
     * component through this.data.preferences.
     *
     * @returns {{preferences: ?PreferenceSet}}
     */
    getMeteorData() {
        // Get all necessary subscriptions
        Meteor.subscribe('userpreferences');

        // Find the preference set for the current user.
        let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

        // Subscribe to events.
        this.eventSub = Meteor.subscribe('events', this.state.page, new Date(), {
            onReady: function () {
                let eventCount = Counts.get('dashboard-event-count');
                this.setState({totalPages: Math.ceil(eventCount / 50)});
            }.bind(this)
        });

        // Get events from the database.
        let events = Event.getCollection().find({},
            {
                // Assert limit and sorting for the events.
                limit: 50,
                sort: {
                    like_count: -1,
                    dislike_count: 1,
                    popularity_score: -1
                },
                skip: (this.state.page - 1) * 50
            }
        ).fetch();

        Meteor.subscribe('categories');

        let categories = Category.getCollection().find().fetch();

        // Return the preference and the user's events. This is available in this.data.
        return {preferences, events, categories}
    };


    componentWillUnmount() {
        if (this.eventSub)
            this.eventSub.stop();
    };


    /** @inheritDoc */
    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        // Initialize the sidebar
        $(rootNode).find('.ui.sidebar')
            .sidebar({
                context: $(rootNode).find('.ui.bottom'),
                dimPage: false,
                // Every time the sidebar state changes, update this.state.filter.open.
                onVisible: function () {
                    this.setState({filter: {open: true}});
                }.bind(this),
                onHide: function () {
                    this.setState({filter: {open: false}});
                }.bind(this)
            });

        /**TODO: implement this maybe? This could try to guess the user's location based on IP address.*/
        //Meteor.call('guessUserLocation', function (err, res) {
        //    console.log(err);
        //    console.log(res);
        //});
    };

    /**
     * Loads the next page of events.
     *
     * @private
     */
    _loadNextPage() {
        if (this.state.page < this.state.totalPages)
            this.setState({page: this.state.page + 1, loading: false});
    };


    /**
     * Loads the previous page of events.
     *
     * @private
     */
    _loadPreviousPage() {
        if (this.state.page > 1)
            this.setState({page: this.state.page - 1, loading: false});
    };


    /**
     * Toggles the filter menu sidebar.
     *
     * @private
     */
    _toggleFilterMenu() {
        // Same thing as before, might want to store this as a variable.
        let rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.ui.sidebar').sidebar('toggle');
    };


    /**
     * Sends the verification email when the user clicks the 'Send Again' button.
     *
     * @private
     */
    _sendEmailVerification() {
        this.setState({isSendingEmail: true});
        Meteor.call('resendEmailVerification', function (err, res) {
            if (!err) {
                this.setState({isSendingEmail: false});
                Alert.success('Email Sent!');
            } else {
                Alert.error('Could not resend email. Please try again later.')
            }
        }.bind(this))
    };


    /**
     * Gets the header for the page if the user is not verified.
     *
     * @returns {XML} - The header for the page.
     * @private
     */
    _getVerifyEmailHeader() {
        // If the user object isn't available yet, display a loading message.
        if (!this.props.currentUser) {
            return (
                <div className="ui text container middle aligned">
                    <div className="ui active dimmer primary-color">
                        <div className="ui large loader"></div>
                    </div>
                </div>
            );
        }

        // Else, display the verify email message.
        return (
            <div className="ui text container center aligned verify-email">
                <h2>An email was sent to {this.props.currentUser.emails[0].address}.</h2>
                <h4>Please follow the instructions to verify your email.</h4>
                <button className={"ui inverted button" + (this.state.isSendingEmail ? 'loading' : '')}
                        onClick={this._sendEmailVerification.bind(this)}>
                    Send Again
                </button>
            </div>
        )
    };


    /**
     * Shows the header content when the user is verified.
     *
     * @returns {XML} - The header content containing the featured events.
     * @private
     */
    _showHeadContent() {
        return <FeaturedEvents />
    };


    /**
     * The callback function called when a user updates his/her preferences via the filters.
     *
     * @param newPrefs {PreferenceSet} - The user's new preference set.
     * @private
     */
    _filterChangeCallback() {
        this.setState({page: 1});
    };


    /**
     *
     */
    _setLoadingCallback(isLoading) {
        this.setState({loading: isLoading});
    };


    /** @inheritDoc */
    render() {
        let mastheadContent = this.props.currentUser && isUserVerified(this.props.currentUser) ?
            this._showHeadContent() :
            this._getVerifyEmailHeader();

        let loading = this.state.loading ?
            <div className="ui active inverted dimmer">
                <div className="ui text large loader">Loading Events</div>
            </div> : null;

        let getSelectLocationOverlay = this.data.preferences && !this.data.preferences.location ?
            <div className="ui active dimmer">
                <div className="content">
                    <div className="center">
                        <h2 className="ui inverted header container">
                            Unfortunately we're not psychic.
                            Please select a location for us to show you events for.
                        </h2>
                    </div>
                </div>
            </div> : null;

        let content = this.data.events && this.data.events.length > 0 ? (
            <div>
                <div className="ui attached">
                    <EventGrid events={this.data.events}/>
                </div>
                <br/>
                <div className="ui two bottom attached huge buttons">
                    <button className={"ui primary button " + (this.state.page > 1 ? '' : 'disabled')}
                            onClick={this._loadPreviousPage.bind(this)}>
                        Previous Page
                    </button>
                    <button
                        className={"ui primary button " + (this.state.page < this.state.totalPages ? '' : 'disabled')}
                        onClick={this._loadNextPage.bind(this)}>
                        Next Page
                    </button>
                </div>
            </div>
        ) : (
            <div className="ui active dimmer">
                <div className="content">
                    <div className="center">
                        <h2 className="ui inverted header container">
                            No More Events
                        </h2>
                    </div>
                </div>
            </div>
        );

        return (
            <div>
                <div className="ui inverted vertical segment dashboard-masthead primary-color">
                    {mastheadContent}
                </div>
                <div className="ui menu attached secondary labeled icon filter-menu sticky">
                    <a className={'item ' + (this.state.filter.open ? 'active' : '')}
                       onClick={this._toggleFilterMenu.bind(this)}>
                        <i className="options icon"/>
                        Filters
                    </a>
                    <div className="right menu">
                        <a className="item">
                            <i className="map icon"/>
                            Map View
                        </a>
                    </div>
                </div>
                <div className="ui bottom attached segment pushable">
                    <div className="ui left vertical sidebar menu">
                        <Filters preferences={this.data.preferences}
                                 categories={this.data.categories}
                                 filterChangeCallback={this._filterChangeCallback.bind(this)}
                                 setLoadingCallback={this._setLoadingCallback.bind(this)}
                        />
                    </div>
                    <div className="dashboard pusher">
                        <div className="ui basic segment main-content">
                            {loading || getSelectLocationOverlay || content}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}