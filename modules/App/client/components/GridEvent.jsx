export default class GridEvent extends React.Component {

    componentDidMount() {

        var rootNode = ReactDOM.findDOMNode(this);

        $(rootNode).find('.dimmer-image').dimmer({
            on: 'hover'
        });
    };

    render() {
        return (
            <div className="ui centered card">
                <div className="content">
                    <i className="right floated thumbs up large icon"/>
                    <i className="right floated thumbs down large icon"/>
                    <div className="header">{this.props.event.title}</div>
                </div>
                <div className="blurring image dimmable dimmer-image">
                    <div className="ui dimmer">
                        <div className="content">
                            <div className="center">
                                Event Description Goes Here....
                            </div>
                        </div>
                    </div>
                    <img src="http://semantic-ui.com/images/avatar/large/elliot.jpg"/>
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