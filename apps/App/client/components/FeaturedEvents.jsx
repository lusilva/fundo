/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';

/**
 * Represents the featured events shown at the top of the page.
 *
 * TODO: Needs to be cleaned up a lot.
 * @className
 * @extends React.Component
 *
 */
export default class FeaturedEvents extends React.Component {


    static propTypes = {
        recommendedEvents: React.PropTypes.array
    };

    state = {
        events: null
    };


    componentWillReceiveProps(nextProps) {
        if (nextProps.recommendedEvents && !_.isEqual(this.props.recommendedEvents, nextProps.recommendedEvents)) {
            this._getRecommendedEvents(nextProps.recommendedEvents);
        }
    };

    componentWillMount() {
        this._getRecommendedEvents();
    };

    _getRecommendedEvents(recommendedEventIds) {
        if (!recommendedEventIds) {
            this.setState({events: null});
            return;
        }
        let events = Event.getCollection().find(
            {
                _id: {
                    $in: recommendedEventIds || []
                }
            },
            {
                // Assert limit and sorting for the events.
                limit: 20,
                reactive: false,
                sort: {
                    like_count: -1,
                    dislike_count: 1,
                    popularity_score: -1
                }
            }
        ).fetch();
        this.setState({events: events});
    };

    render() {
        let settings = {
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '20px',
            autoplay: false,
            autoplaySpeed: 2000,
            pauseOnHover: true,
            dots: true,
            arrows: false
        };

        let loading = !this.state.events ? (
            <div className="ui active inverted text large loader">Loading Recommendations</div>
        ) : null;

        let slider = this.state.events && this.state.events.length > 0 ? (
            <Slider {...settings}>
                {_.map(this.state.events, function (event) {
                    return (
                        <div key={event.id}>
                            <div className="ui segment featured-event">
                                <div className="content">
                                    <img className="right floated mini ui image"
                                         src="http://semantic-ui.com/images/avatar/large/elliot.jpg"/>
                                    <div className="header">
                                        Elliot Fu
                                    </div>
                                    <div className="meta">
                                        Friends of Veronika
                                    </div>
                                    <div className="description">
                                        Elliot requested permission to view your contact details
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Slider>
        ) : (
            <div>No Recommended Events..</div>
        );

        return (
            <div className="ui container">
                {loading || slider}
            </div>
        )
    }
}