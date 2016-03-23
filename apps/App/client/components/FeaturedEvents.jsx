/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import FeaturedEvent from './FeaturedEvent';
import _ from 'lodash';

/**
 * Represents the featured events shown at the top of the page.
 *
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
        let enoughEvents = !!this.state.events && this.state.events.length > 2;

        let settings = {
            infinite: true,
            speed: 500,
            slidesToShow: Math.min(3, this.state.events ? this.state.events.length : 3),
            centerMode: enoughEvents,
            draggable: enoughEvents,
            centerPadding: '20px',
            autoplay: enoughEvents,
            autoplaySpeed: 5000,
            pauseOnHover: true,
            dots: enoughEvents,
            arrows: enoughEvents,
            lazyLoad: enoughEvents,
            responsive: [{
                breakpoint: 728,
                settings: {
                    slidesToShow: Math.min(2, this.state.events ? this.state.events.length : 2)
                }
            }, {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(1, this.state.events ? this.state.events.length : 1)
                }
            }]
        };

        let loading = !this.state.events ? (
            <div className="ui active inverted text large loader">Loading Recommendations</div>
        ) : null;

        let slider = this.state.events && this.state.events.length > 0 ? (
            <Slider {...settings}>
                {_.map(this.state.events, function (event) {
                    return (
                        <div key={'featured-' + event.id}>
                            <div className={enoughEvents ? '' : 'featured-scaled-event'}>
                                <FeaturedEvent event={event}/>
                            </div>
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