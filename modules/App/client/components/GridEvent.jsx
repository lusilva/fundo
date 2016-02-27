import TextTruncate from 'react-text-truncate';

export default class GridEvent extends React.Component {

    static propTypes = {
        event: React.PropTypes.object.isRequired
    };

    componentDidMount() {
        var rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('img')
            .visibility({
                type: 'image',
                transition: 'fade in',
                duration: 1000
            });
    };


    _sanitizeHTML(htmlString, fallbackText) {
        let div = document.createElement("div");
        div.innerHTML = htmlString;
        return div.textContent || div.innerText || fallbackText;
    };

    render() {
        let event = this.props.event;

        let time = event.start_time ? moment(event.start_time) : "unknown time";
        if (event.start_time && event.stop_time) {
            time = time.twix(event.stop_time);
        }

        let eventImage = "http://semantic-ui.com/images/avatar/large/elliot.jpg";
        if (event.image && event.image.large) {
            eventImage = event.image.large.url;
        } else if (event.image && event.image.medium) {
            eventImage = event.image.medium.url;
        }


        let venue = event.venue && event.venue.name ? event.venue.name : "unknown venue";

        return (
            <div className="ui column">
                <div className="ui fluid card">
                    <div className="content">
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
                                line={10}
                                truncateText="…"
                                text={this._sanitizeHTML(event.description, "No Description Available")}
                                showTitle={false}/>
                        </div>
                    </div>
                    <div className="content">
                        <div className="header">{venue}</div>
                        <div className="meta">
                            <span
                                className="date">{event.stop_time ? time.format() : time.format('MMM Do, h:mm a')}</span>
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