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
            .modal('attach events', $(rootNode).find(".ui.fluid.card"), 'show')
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
                <br/>
                <h4 className="ui horizontal divider header">
                    <i className="tag icon"/>
                    Relevant Links
                </h4>
                <div className="ui list">
                    {_.map(links, function (link, index) {
                        return (
                            <a className="ui item"
                               href={link}
                               key={event.id + '-link-' + index}>
                                {parseLink(link).hostname}
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
        if (event.image && event.image.medium) {
            eventImage = event.image.medium.url;
        } else if (event.image && event.image.large) {
            eventImage = event.image.large.url;
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
                    <div className="content">
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
                                line={10}
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
                    </div>
                    <div className="content">
                    <span className="right floated">
                        <i className="heart outline like icon"/>
                            17 likes
                    </span>
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
                            <div className="description">
                                {event.description}
                            </div>
                            {this._getRelevantLinks()}
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        );
    };
}