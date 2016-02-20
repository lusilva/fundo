/* global React */

import { isUserVerified } from 'App/helpers';
import Shuffle from 'react-shuffle';
import Alert from 'react-s-alert';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @extends React.Component
 */
export default class Dashboard extends React.Component {

    alphabet = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    state = {
        filter: {
            iconClass: 'options',
            iconText: 'Open Filters',
            open: true
        },
        children: this.alphabet,
        isSendingEmail: false
    };

    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        // Initialize the sidebar
        $(rootNode).find('.ui.sidebar')
            .sidebar({
                context: $(rootNode).find('.ui.bottom'),
                dimPage: false,
                closable: false
            });

        // React shuffle can't handle too many nodes, need to come
        // up with better way of adding events if we want to keep animation.
        //$(rootNode).find('.dashboard.pusher')
        //    .visibility({
        //        once: false,
        //        // update size when new content loads
        //        observeChanges: true,
        //        // load content on bottom edge visible
        //        onBottomVisible: function () {
        //            // loads a max of 5 times
        //            this._loadMoreEvents();
        //        }.bind(this)
        //    });
    };

    _toggleFilterMenu() {
        // Same thing as before, might want to store this as a variable
        let rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.ui.sidebar').sidebar('toggle');

        let filter = !this.state.filter.open ?
        {
            iconClass: 'options',
            iconText: 'Open Filters',
            open: true
        } :
        {
            iconClass: 'options',
            iconText: 'Hide Filters',
            open: false
        };

        this.setState({filter: filter});
    };

    _renderEvents() {
        return this.state.children.map(function (letter) {
            return (
                <div className="tile" key={letter}>
                    <img
                        src={"http://placehold.it/100x100&text=" + letter}/>
                </div>
            )
        }.bind(this))
    };

    _loadMoreEvents() {
        this.alphabet = this.alphabet.concat(this.alphabet);
        this.setState({children: this.alphabet});
    };

    _sendEmailVerification() {
        this.setState({isSendingEmail: true});
        Meteor.call('resendEmailVerification', function (err, res) {
            if (!err) {
                this.setState({isSendingEmail: false});
                Alert.success('Email Sent!')
            } else {
                Alert.error('Could not resend email. Please try again later.')
            }
        }.bind(this))
    };

    _getVerifyEmailHeader() {
        if (!this.props.currentUser) {
            return (
                <div className="ui active dimmer primary-color">
                    <div className="ui large loader"></div>
                </div>
            );
        }

        return (
            <div>
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
        return (
            <div>
                <h1>FEATURED EVENTS</h1>
                <div className="ui card">
                    <a href="http://www.eventful.com">
                        <div className="image">
                                <img src={require("App/client/img/eventful.png")} width="200" height="200"/>
                        </div>
                    </a>
                    <div className="content">
                        <a className="header">Event Name</a>
                        <div className="meta">
                            <span className="date">Joined in 2013</span>
                        </div>
                        <div className="description">
                            Description of event
                        </div>
                    </div>
                    <div className="extra content">
                        <div className="ui two buttons">
                            <div className="ui basic blue button">I'm Interested!</div>
                            <div className="ui basic red button">Not interested</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    filterChildren() {
        if (this.state.filtered === false) {
            let newChildren = this.state.children.filter(function (child, index) {
                if (index % 2 === 0) {
                    return child
                }
            });
            this.setState({
                children: newChildren,
                filtered: true
            });
        } else {
            this.setState({
                children: this.alphabet,
                filtered: false
            });
        }
    };


    /** @inheritDoc */
    render() {

        let mastheadContent = isUserVerified(this.props.currentUser) ?
            this._showHeadContent() :
            this._getVerifyEmailHeader();

        let filters = (
            <div>
                <button type="button" onClick={this.filterChildren.bind(this)}>Filter Children</button>
            </div>
        );

        return (
            <div>
                <div className="ui inverted vertical center aligned segment dashboard-masthead primary-color">
                    <div className="ui text container middle aligned">
                        {mastheadContent}
                    </div>
                </div>
                <div className="ui labeled icon menu attached">
                    <a className="item" onClick={this._toggleFilterMenu.bind(this)}>
                        <i className={this.state.filter.iconClass + " icon"}/>
                        {this.state.filter.iconText}
                    </a>
                </div>
                <div className="ui bottom attached segment pushable">
                    <div className="ui left vertical sidebar menu">
                        {filters}
                    </div>
                    <div className="dashboard pusher">
                        <div className="ui basic segment main-content">
                            <div className="ui container">
                                <Shuffle duration={500} fade={false}>
                                    {this._renderEvents()}
                                </Shuffle>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}