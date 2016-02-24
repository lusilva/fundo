/* global React, Meteor, ReactMeteorData */

import { isUserVerified } from 'App/helpers';
import Alert from 'react-s-alert';
import FeaturedEvents from './FeaturedEvents';
import EventGrid from './EventGrid';
import ReactMixin from 'react-mixin';
import PreferenceSet from 'App/collections/PreferenceSet';
import Filters from './Filters';

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
        location: null
    };

    /**
     * Function that runs automatically everytime the data that its subscribed to changes.
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

        // Return the preference. This is available in this.data.preferences.
        return {preferences}
    };

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

    /** @inheritDoc */
    render() {

        let mastheadContent = isUserVerified(this.props.currentUser) ?
            this._showHeadContent() :
            this._getVerifyEmailHeader();

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
                        <a className="item">
                            <i className="frown icon"/>
                            Dislike All
                        </a>

                    </div>
                </div>
                <div className="ui bottom attached segment pushable">
                    <div className="ui left vertical sidebar menu">
                        <Filters preferences={this.data.preferences}/>
                    </div>
                    <div className="dashboard pusher">
                        <div className="ui basic segment main-content">
                            <EventGrid />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}