import TextTruncate from 'react-text-truncate';

export default class FeaturedEvent extends React.Component {

    static propTypes = {
        event: React.PropTypes.object.isRequired
    };


    render() {

        let event = this.props.event;

        //TODO: change this to be placeholder image based on category.
        let eventImage = "http://semantic-ui.com/images/avatar/large/elliot.jpg";
        // First check if event has a medium image, if not then check if it has a large image.
        if (event.image && event.image.large) {
            eventImage = event.image.large.url;
        } else if (event.image && event.image.medium) {
            eventImage = event.image.medium.url;
        }


        // Format the start and end time using moment.js
        let time = event.start_time ? moment(event.start_time) : "unknown time";
        if (event.start_time && event.stop_time) {
            time = time.twix(event.stop_time);
        }

        return (
            <div className="ui fluid card featured-event">
                <div className="content">
                    <img className="right floated mini ui image"
                         src={eventImage}/>
                    <div className="header">
                        <TextTruncate
                            line={1}
                            truncateText="…"
                            text={event.title}
                            showTitle={false}/>
                    </div>
                    <div className="meta">
                        <div className="date">
                            {event.stop_time ? time.format() : time.format('MMM Do, h:mm a')}
                        </div>
                    </div>
                    <div className="description">
                        Event Description Goes Here
                    </div>
                </div>
                <div className="ui bottom attached primary button more-info-button">
                    More Info
                </div>
            </div>
        )
    }
};