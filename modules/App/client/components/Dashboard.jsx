/* global React */

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
 * @extends React.Component
 */
@ReactMixin.decorate(ReactMeteorData)
export default class Dashboard extends React.Component {
    state = {
        filter: {
            open: false
        },
        isSendingEmail: false,
        location: null
    };

    subs = [];

    getMeteorData() {
        // Get all necessary subscriptions
        Meteor.subscribe('userpreferences');

        let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

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
                onVisible: function () {
                    this.setState({filter: {open: true}});
                }.bind(this),
                onHide: function () {
                    this.setState({filter: {open: false}});
                }.bind(this)
            });
        // TODO: implement this maybe?
        Meteor.call('guessUserLocation', function (err, res) {
            console.log(err);
            console.log(res);
        });
    };

    _toggleFilterMenu() {
        // Same thing as before, might want to store this as a variable
        let rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.ui.sidebar').sidebar('toggle');
    };

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

    _getVerifyEmailHeader() {
        if (!this.props.currentUser) {
            return (
                <div className="ui text container middle aligned">
                    <div className="ui active dimmer primary-color">
                        <div className="ui large loader"></div>
                    </div>
                </div>
            );
        }

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