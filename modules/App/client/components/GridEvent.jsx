import TextTruncate from 'react-text-truncate';
import parseLink from 'parse-link';

/**
 * The view component for an event card.
 *
 * @class
 * @extends React.Component
 */
export default class GridEvent extends React.Component {

    /**
     * The props this component receives.
     * @type {{event: *}}
     */
    static propTypes = {
        event: React.PropTypes.object.isRequired
    };

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

        this.setState({liked: _.contains(this.props.event.likes, Meteor.userId())});
    };

    _like(clickEvent) {
        clickEvent.preventDefault();
        this.props.event.like(function (err, res) {
            if (err) {
                this.setState({liked: false});
            }
        }.bind(this));
        this.setState({liked: true});
    };

    _dislike(clickEvent) {
        clickEvent.preventDefault();
        this.props.event.dislike(function (err, res) {
            if (err) {
                this.setState({disliked: false});
            }
        }.bind(this));
        this.setState({disliked: true});

    };

    _getLikes() {
        let event = this.props.event;

        if (this.state.disliked) {
            return null;
        }

        return (
            <span className="right floated">
                <i className={"heart " + (this.state.liked ? "" : "outline") + " like icon"}
                   onClick={this._like.bind(this)}/>
                {event.likes.length} likes
            </span>
        );
    };

    _getDislikes() {
        let event = this.props.event;

        if (this.state.liked) {
            return null;
        }

        return (
            <span className="right floated">
                <i className={"thumbs down " + (this.state.disliked ? "" : "outline") + " like icon"}
                   onClick={this._dislike.bind(this)}/>
                {event.dislikes.length} dislikes
            </span>

        );
    };

    _getCategoryRibbon() {

        let event = this.props.event;
        let category = event.categories[0] || {name: "Eventful Event"};

        return (
            <div className="ui black ribbon label">
                {category.name}
            </div>
        )
    };

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
            <div>
                <h4 className="ui horizontal section divider header">
                    <i className="linkify icon"/>
                    Links
                </h4>
                <div className="ui list">
                    {_.map(_.uniq(links), function (link, index) {
                        let parsedLink = parseLink(link);

                        return (
                            <a className="ui item"
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
            <div className="ui column">
                <div className="ui fluid card">
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
                            <TextTruncate
                                line={7}
                                truncateText="…"
                                text={event.description}
                                showTitle={false}/>
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
                                {event.description}
                            </div>
                            <div className="ui horizontal section divider"></div>

                            <div className="ui two column grid">
                                <div className="column">
                                    <h4 className="ui horizontal section divider header">
                                        <i className="home icon"/>
                                        Venue
                                    </h4>
                                    <div className="description center">
                                        <a href={event.venue.url}>{event.venue.name}, {event.venue.address}</a>
                                    </div>
                                </div>
                                <div className="column">
                                    {this._getRelevantLinks()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    };
}