import TextTruncate from 'react-text-truncate';

export default class GridEvent extends React.Component {

    static propTypes = {
        event: React.PropTypes.object.isRequired
    };

    componentDidMount() {
        var rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.dimmer-image').dimmer({
            on: 'hover'
        });
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
                            showTitle={true}/>
                    </div>
                </div>
                <div className="blurring image dimmable dimmer-image">
                    <div className="ui dimmer">
                        <div className="content">
                            <div className="center">
                                {this.props.event.description}
                            </div>
                        </div>
                    </div>
                    <img src={eventImage}/>
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