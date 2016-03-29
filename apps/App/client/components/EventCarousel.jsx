/* global React, Meteor */

import Event from 'App/collections/Event';

import Slider from 'react-slick';
import TextTruncate from 'react-text-truncate';
import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import _ from 'lodash';

import GridEvent from './GridEvent';

/**
 * Represents the featured events shown at the top of the page.
 *
 * @className
 * @extends React.Component
 *
 */
@ReactMixin.decorate(PureRenderMixin)
@ReactMixin.decorate(ReactMeteorData)
export default class EventCarousel extends React.Component {


    static propTypes = {
        category: React.PropTypes.object.isRequired,
        sizes: React.PropTypes.object.isRequired
    };

    state = {
        loading: true,
        reactive: false
    };

    refreshHandle = null;

    getMeteorData() {
        Meteor.subscribe('events', new Date(), this.props.category.name, {
            onReady: function () {
                if (this.state.loading)
                    this.setState({loading: false, reactive: false});
            }.bind(this)
        });

        let events = Event.getCollection().find(
            {
                categories: {
                    $in: [this.props.category.name]
                }
            },
            {
                // Assert limit and sorting for the events.
                sort: {
                    start_time: 1
                },
                reactive: this.state.reactive
            }
        ).fetch();

        return {events}
    };

    componentDidMount() {
        this.refreshHandle = Meteor.setInterval(function () {
            this.setState({reactive: true});
        }.bind(this), 30000);
    };

    componentWillUnmount() {
        Meteor.clearInterval(this.refreshHandle);
    };

    render() {
        let sizes = this.props.sizes;
        let enoughEvents = !!this.data.events && this.data.events.length >= sizes.large;

        let settings = {
            infinite: false,
            autoplay: false,
            speed: 500,
            slidesToShow: sizes.large,
            slidesToScroll: Math.min(sizes.large, this.data.events ? this.data.events.length : sizes.large),
            centerMode: false,
            draggable: enoughEvents,
            dots: false,
            arrows: true,
            lazyLoad: enoughEvents,
            responsive: [{
                breakpoint: 728,
                settings: {
                    slidesToShow: Math.min(sizes.medium, this.data.events ? this.data.events.length : sizes.medium),
                    slidesToScroll: Math.min(sizes.medium, this.data.events ? this.data.events.length : sizes.medium)
                }
            }, {
                breakpoint: 480,
                settings: {
                    slidesToShow: Math.min(sizes.small, this.data.events ? this.data.events.length : sizes.small),
                    slidesToScroll: Math.min(sizes.small, this.data.events ? this.data.events.length : sizes.small)
                }
            }]
        };

        let that = this;

        let loader = this.state.loading ? (
            <div className="ui active centered inline text loader carousel-loader">
                Loading {this.props.category.name}</div>
        ) : null;

        let slider = this.data.events && this.data.events.length > 0 && !this.state.loading ? (
            <div>
                <h1 className="ui left floated header">{this.props.category.name} ({this.data.events.length})</h1>
                <div className="ui clearing divider"></div>
                <Slider {...settings}>
                    {_.map(this.data.events, function (event) {
                        return (
                            <div key={that.props.category.category_id + '-' + event.id + '-' + 'event-carousel'}>
                                <GridEvent event={event}/>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        ) : null;

        return (
            <div className="ui container">
                {loader || slider}
            </div>
        )
    }
}