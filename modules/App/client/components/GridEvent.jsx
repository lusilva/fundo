import TextTruncate from 'react-text-truncate';

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
        var rootNode = ReactDOM.findDOMNode(this);

        // Lazy load the images until they are visible.
        $(rootNode).find('img')
            .visibility({
                type: 'image',
                transition: 'fade in',
                duration: 1000
            });

        // Make a popup for event titles that are longer and get cut off.
        $(rootNode).find('.event-title')
            .popup();
    };

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
                <div className="ui fluid link card" id={"#" + event.id}>
                    <div className="content event-title" data-content={event.title}>
                        <div className="header">
                            <TextTruncate
                                line={1}
                                truncateText="…"
                                text={event.title}
                                showTitle={false}/>
                        </div>
                    </div>
                    <div className="ui slide masked reveal event-grid-image">
                        <img src={eventImage} data-src={eventImage} className="visible transition content image"/>
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
                                line={12}
                                truncateText="…"
                                text={event.description}
                                showTitle={false}/>
                        </div>
                    </div>
                    <div className="content">
                        <div className="header">{venueName}</div>
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
            </div>
        );
    };
}