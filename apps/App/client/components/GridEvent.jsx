/* global Meteor, React */

import TextTruncate from 'react-text-truncate';
import parseLink from 'parse-link';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';
import renderHTML from 'react-render-html';
import _ from 'lodash';

/**
 * The view component for an event card.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class GridEvent extends React.Component {

    /**
     * The props this component receives.
     *
     * @type {{event: Event}}
     */
    static propTypes = {
        event: React.PropTypes.object.isRequired
    };

    /**
     * The state of this component.
     *
     * @type {{liked: boolean, disliked: boolean, category: string}}
     */
    state = {
        liked: false,
        disliked: false
    };


    /** @inheritDoc */
    componentDidMount() {
        let rootNode = ReactDOM.findDOMNode(this);

        // Lazy load the images until they are visible.
        $(rootNode).find('.card-image')
            .visibility({
                type: 'image',
                transition: 'fade in',
                duration: 1000
            });

        // Make a popup for event titles that are longer and get cut off.
        $(rootNode).find('.event-title')
            .popup();

        $(rootNode).find('.ui.modal.event-details')
            .modal('setting', 'transition', 'horizontal flip')
            .modal('attach events', $(rootNode).find(".more-info-button"), 'show');

        this.setState({
            liked: _.includes(this.props.event.likes, Meteor.userId()),
            disliked: _.includes(this.props.event.dislikes, Meteor.userId())
        });
    };


    /**
     * Toggle liking/unliking of this event.
     *
     * @param clickEvent
     * @private
     */
    _toggleLike(clickEvent) {
        clickEvent.preventDefault();

        let event = this.props.event;

        // If this event has already been liked, then unlike it.
        if (this.state.liked) {
            Meteor.call('unlike', event.id, function (err, res) {
                if (err) {
                    this.setState({liked: true});
                }
            }.bind(this));
            this.setState({liked: false});
            event.unlike();

            // Else, if this event isn't liked yet then like it.
        } else {
            Meteor.call('like', event.id, function (err, res) {
                if (err) {
                    this.setState({liked: false});
                }
            }.bind(this));
            this.setState({liked: true});
            event.like();
        }
    };


    /**
     * Toggle disliking/undisliking this event.
     *
     * @param clickEvent
     * @private
     */
    _toggleDislike(clickEvent) {
        clickEvent.preventDefault();

        let event = this.props.event;

        // If this event is already disliked, then undislike it.
        if (this.state.disliked) {
            Meteor.call('undislike', event.id, function (err, res) {
                if (err) {
                    this.setState({disliked: true});
                }
            }.bind(this));
            this.setState({disliked: false});
            event.undislike();
            // Else, dislike this event.
        } else {
            Meteor.call('dislike', event.id, function (err, res) {
                if (err) {
                    this.setState({disliked: false});
                }
            }.bind(this));
            this.setState({disliked: true});
            event.dislike();
        }
    };

    /**
     * Get likes icon and count for this event.
     *
     * @returns {?JSX} - null if user has disliked this event.
     * @private
     */
    _getLikes() {
        let event = this.props.event;

        if (this.state.disliked) {
            return null;
        }

        return (
            <span className="right floated">
                <i className={"heart " + (this.state.liked ? "" : "outline") + " like icon"}
                   onClick={this._toggleLike.bind(this)}/>
                {event.likes.length} likes
            </span>
        );
    };


    /**
     * Get dislikes icon and count for this event.
     *
     * @returns {?JSX} - null if user has liked this event.
     * @private
     */
    _getDislikes() {
        let event = this.props.event;

        if (this.state.liked) {
            return null;
        }

        return (
            <span className="right floated">
                <i className={"thumbs down " + (this.state.disliked ? "" : "outline") + " like icon"}
                   onClick={this._toggleDislike.bind(this)}/>
                {event.dislikes.length} dislikes
            </span>

        );
    };


    /**
     * Get the category for this event.
     *
     * @returns {XML}
     * @private
     */

    _getCategoryRibbon() {
        let category = this.props.event.categories[0] || 'Eventful Event';

        return (
            <div className="ui black ribbon label">
                {category}
            </div>
        )
    };


    /**
     * Get relevant links for this event, shown in the more info modal.
     *
     * @returns {*}
     * @private
     */
    _getRelevantLinks() {
        let event = this.props.event;
        let links = event.links || [];

        // Get eventful url and append it to the links.
        if (event.url) {
            links = links.concat(event.url);
        }

        // If there are no links, return null.
        if (links.length == 0) {
            return null;
        }

        return (
            <div className="column">
                <h4 className="ui horizontal section divider header">
                    <i className="linkify icon"/>
                    Links
                </h4>
                <div className="ui relaxed list">
                    {_.map(_.uniq(links), function (link, index) {
                        let parsedLink = parseLink(link);

                        return (
                            <a className="ui item"
                               target="_blank"
                               href={link}
                               key={event.id + '-link-' + index}>
                                {
                                    parsedLink.hostname +
                                    (
                                        parsedLink.path && parsedLink.path.split('/').length > 1 ?
                                        '/' + parsedLink.path.split('/')[1] : ''
                                    )
                                }
                            </a>
                        )
                    })}
                </div>
            </div>
        )
    };


    /**
     * Get the info for tickets if available.
     *
     * @private
     */
    _getTicketInfo() {
        let event = this.props.event;

        if (!event.tickets || event.tickets.length == 0) {
            return null;
        }

        let ticketLinks = event.tickets.link || [];

        return (
            <div className="column">
                <h4 className="ui horizontal section divider header">
                    <i className="ticket icon"/>
                    Get Tickets
                </h4>
                <div className="ui relaxed list">
                    {_.map(ticketLinks, function (link, index) {
                        if (!link.url) return null;
                        return (
                            <a href={link.url}
                               target="_blank"
                               key={event.id+'-tickets-'+index}
                               className="ui item">
                                {link.provider || ('Ticket Link ' + index)}
                            </a>
                        );
                    })}
                </div>
            </div>

        );
    };


    /** @inheritDoc */
    render() {
        let event = this.props.event;

        // Format the start and end time using moment.js
        let time = event.start_time ? moment(event.start_time) : "unknown time";
        if (event.start_time && event.stop_time) {
            time = time.twix(event.stop_time);
        }

        //TODO: change this to be placeholder image based on category.
        let eventImage = "http://semantic-ui.com/images/avatar/large/elliot.jpg";
        // First check if event has a medium image, if not then check if it has a large image.
        if (event.image && event.image.large) {
            eventImage = event.image.large.url;
        } else if (event.image && event.image.medium) {
            eventImage = event.image.medium.url;
        }

        // Get the venue information, doing all necessary null checking.
        let venueName = event.venue && event.venue.name ? event.venue.name : "unknown venue";
        let venueAddress = event.venue && event.venue.address ? event.venue.address : "unknown address";

        return (
            <div className="ui card">
                <div className="ui content">
                    {this._getCategoryRibbon()}
                </div>
                <div className="ui content">
                    <div className="container header event-title" data-content={event.title}>
                        <TextTruncate
                            line={1}
                            truncateText="…"
                            text={event.title}
                            showTitle={false}/>
                    </div>
                </div>
                <div className="ui slide masked reveal event-grid-image">
                    <img src={eventImage}
                         data-src={eventImage}
                         className="visible transition content image card-image"/>
                    <div className="ui hidden content text event-description">
                        <div className="content bottom attached">
                            <div className="eventful-badge eventful-small">
                                <img src="http://api.eventful.com/images/powered/eventful_58x20.gif"
                                     alt="Local Events, Concerts, Tickets"
                                />
                                <p><a href="http://eventful.com/">Events</a> by Eventful</p>
                            </div>
                        </div>
                        <div className="ui divider"></div>
                        {renderHTML(event.description || "No Description Available")}
                    </div>
                </div>
                <div className="content">
                    <div className="header">
                        <TextTruncate
                            line={1}
                            truncateText="…"
                            text={venueName}
                            showTitle={false}/>
                    </div>
                    <div className="meta">
                            <span className="date">
                                {event.stop_time ? time.format() : time.format('MMM Do, h:mm a')}
                            </span>
                    </div>
                    <div className="meta">
                        {this._getDislikes()}
                        {this._getLikes()}
                    </div>
                </div>
                <div className="ui bottom attached primary button more-info-button">
                    More Info
                </div>
                <div className="ui modal event-details">
                    <i className="close icon"/>
                    <div className="header">
                        {event.title}
                    </div>
                    <br/>
                    <div className="ui grid container">
                        <div className="ui content four wide column">
                            <div className="ui fluid image">
                                <img src={eventImage}/>
                            </div>
                            <div className="eventful-badge eventful-small">
                                <img src="http://api.eventful.com/images/powered/eventful_58x20.gif"
                                     alt="Local Events, Concerts, Tickets"
                                />
                                <p><a href="http://eventful.com/">Events</a> by Eventful</p>
                            </div>
                        </div>
                        <div className="ui content twelve wide column">
                            <h4 className="ui ui horizontal section divider hidden">Description</h4>
                            <div className="description">
                                {renderHTML(event.description || "No Description Available")}
                            </div>
                            <div className="ui horizontal section divider"></div>

                            <div className="ui two column grid">
                                <div className="column">
                                    <h4 className="ui horizontal section divider header">
                                        <i className="home icon"/>
                                        Venue
                                    </h4>
                                    <div className="description center">
                                        <div className="date">
                                            {event.stop_time ? time.format() : time.format('MMM Do, h:mm a')}
                                        </div>
                                        <a target="_blank" href={event.venue.url}>{venueName}, {venueAddress}</a>
                                    </div>
                                </div>
                                {this._getRelevantLinks()}
                                {this._getTicketInfo()}
                            </div>
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    };
}