/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import FeaturedEvent from '../Event/FeaturedEvent';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import _ from 'lodash';

import ReactMixin from 'react-mixin';

/**
 * Represents the featured events shown at the top of the page.
 *
 * @className
 * @extends React.Component
 *
 */
@ReactMixin.decorate(ReactMeteorData)
@ReactMixin.decorate(PureRenderMixin)
export default class FeaturedEvents extends React.Component {

    state = {
        recommendedIds: null,
        loading: true
    };

    getMeteorData() {
        Meteor.subscribe('recommended', this.state.recommendedIds, {
            onReady: function () {
                if (this.state.loading) {
                    this.setState({loading: false});
                }
            }.bind(this)
        });

        let events = Event.getCollection().find(
            {
                _id: {
                    $in: this.state.recommendedIds || []
                }
            },
            {
                limit: 20,
                sort: {
                    start_time: 1
                },
                reactive: false
            }).fetch();

        return {events}
    };

    componentDidMount() {
        Meteor.call('getRecommendations', function (err, res) {
            if (err) {
                console.log(err);
            }
            this.setState({recommendedIds: res || [], loading: false});
        }.bind(this));
    };

    render() {
        let enoughEvents = !!this.data.events && this.data.events.length > 2;

        let settings = {
            infinite: true,
            speed: 500,
            slidesToShow: Math.min(3, this.data.events ? this.data.events.length : 3),
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
                    slidesToShow: Math.min(2, this.data.events ? this.data.events.length : 2)
                }
            }, {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(1, this.data.events ? this.data.events.length : 1)
                }
            }]
        };

        let loading = !this.state.recommendedIds || this.state.loading ? (
            <div className="ui active inverted text large loader">Loading Recommendations</div>
        ) : null;

        let slider = this.data.events && this.data.events.length > 0 ? (
            <div className="featured-events">
                <h1 className="ui header inverted centered">Recommended Events</h1>
                <Slider {...settings}>
                    {_.map(this.data.events, function (event) {
                        return (
                            <div key={'featured-' + event.id}>
                                <div className={enoughEvents ? '' : 'featured-scaled-event'}>
                                    <FeaturedEvent event={event}/>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
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