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

        let eventImage = event.image && event.image.medium ? event.image.medium.url :
            "http://semantic-ui.com/images/avatar/large/elliot.jpg";

        return (
            <div className="ui centered card">
                <div className="content">
                    <div className="header">
                        <TextTruncate
                            line={1}
                            truncateText="…"
                            text={this.props.event.title}
                            showTitle={false}/>
                    </div>
                </div>
                <div className="ui slide masked reveal event-grid-image">
                    <img src={eventImage} data-src={eventImage} className="visible transition content image"/>
                    <div className="ui hidden content text event-description">
                        <TextTruncate
                            line={14}
                            truncateText="…"
                            text={this._sanitizeHTML(this.props.event.description, "No Description Available")}
                            showTitle={false}/>
                    </div>
                </div>
                <div className="content">
                    <a className="header">Team Fu</a>
                    <div className="meta">
                        <span className="date">Create in Sep 2014</span>
                    </div>
                </div>
                <div className="extra content center">
                    <div className="eventful-badge eventful-small">
                        <img src="http://api.eventful.com/images/powered/eventful_58x20.gif"
                             alt="Local Events, Concerts, Tickets"
                        />
                        <p><a href="http://eventful.com/">Events</a> by Eventful</p>
                    </div>
                </div>
            </div>
        );
    };
}