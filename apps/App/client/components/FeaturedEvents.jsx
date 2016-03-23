/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import FeaturedEvent from './FeaturedEvent';

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
            speed: 1000,
            slidesToShow: 3,
            centerMode: true,
            centerPadding: '20px',
            autoplay: true,
            autoplaySpeed: 5000,
            pauseOnHover: true,
            dots: true,
            arrows: true,
            lazyLoad: true
        };

        let loading = !this.state.events ? (
            <div className="ui active inverted text large loader">Loading Recommendations</div>
        ) : null;

        let slider = this.state.events && this.state.events.length > 0 ? (
            <Slider {...settings}>
                {_.map(this.state.events, function (event) {
                    return (
                        <div key={'featured-' + event.id}>
                            <FeaturedEvent event={event}/>
                        </div>
                    );
                })}
            </Slider>
        ) : (
            <div className="ui text container center aligned masthead-center">
                <h2>We currently don't have any recommended events for you. Let us know what events you like.</h2>
            </div>
        );

        return (
            <div className="ui container">
                {loading || slider}
            </div>
        )
    }
}