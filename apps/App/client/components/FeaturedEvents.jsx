/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';

/**
 * Represents the featured events shown at the top of the page.
 *
 * TODO: Needs to be cleaned up a lot.
 * @class
 * @extends React.Component
 *
 */
export default class FeaturedEvents extends React.Component {


    static propTypes = {
        recommendedEvents: React.PropTypes.array
    };

    state = {
        events: []
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
            className: 'center',
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '60px',
            autoplay: true,
            autoplaySpeed: 2000,
            pauseOnHover: true,
            dots: true
        };

        let slider = this.state.events && this.state.events.length > 0 ? (
            <Slider {...settings}>
                {_.map(this.state.events, function (event) {
                    return (
                        <div key={event.id}>
                            <h2>{event.title}</h2>
                            <p>Lorem ipsum dolor sit amet.</p>
                        </div>
                    )
                })}
            </Slider>
        ) : (
            <div>No Recommended Events..</div>
        );

        return (
            <div className="ui container">
                {slider}
            </div>
        )
    }
}