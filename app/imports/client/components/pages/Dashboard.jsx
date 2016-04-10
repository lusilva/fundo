/* global React, Meteor, ReactMeteorData */

import PreferenceSet from 'imports/collections/PreferenceSet';
import Event from 'imports/collections/Event';
import Category from 'imports/collections/Category';

import Alert from 'react-s-alert';
import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import _ from 'lodash';

import { isUserVerified } from 'imports/helpers';
import FeaturedEvents from '../carousels/FeaturedEvents';
import EventGrid from '../grids/EventGrid';
import TopEventsCarousel from '../carousels/TopEventsCarousel';
import EventCarousel from '../carousels/EventCarousel';
import Filters from '../filters/Filters';
import MapView from '../map/MapView';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(ReactMeteorData)
@ReactMixin.decorate(PureRenderMixin)
export default class Dashboard extends React.Component {
  static propTypes = {
    currentUser: React.PropTypes.object
  };

  state = {
    filter: {
      open: false
    },
    isSendingEmail: false,
    loading: false,
    categoryLimit: 20,
    searchValue: null,
    mapView: false
  };

  searchTimeout = null;


  /**
   * Function that runs automatically every time the data that its subscribed to changes.
   * In this case, it provides the user preferences data. This is accessible in the rest of the
   * component through this.data.preferences.
   *
   * @returns {{preferences: ?PreferenceSet}}
   */
  getMeteorData() {
    // Get all necessary subscriptions
    Meteor.subscribe('userpreferences');
    Meteor.subscribe('events');
    Meteor.subscribe('categories');

    let events = [];
    if (this.state.searchValue && this.state.searchValue.length > 0) {
      events = Event.getCollection().find(
        {
          $or: [
            {description: {$regex: this.state.searchValue, $options: 'i'}},
            {title: {$regex: this.state.searchValue, $options: 'i'}}
          ]
        }, {reactive: false}).fetch();
    } else {
      events = Event.getCollection().find({}, {reactive: false}).fetch();
    }

    // Find the preference set for the current user.
    let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

    let categories = Category.getCollection().find(
      {
        subcategory: false
      },
      {
        limit: this.state.categoryLimit,
        sort: {category_id: 1}
      }
    ).fetch();

    let numCategories = Category.getCollection().find(
      {
        subcategory: false
      }
    ).count();

    // Return the preference and the user's events. This is available in this.data.
    return {preferences, categories, numCategories, events}
  };


  /** @inheritDoc */
  componentDidMount() {
    // Localize the selector instead of having jQuery search globally
    var rootNode = ReactDOM.findDOMNode(this);

    // Initialize the sidebar
    $(rootNode).find('.ui.sidebar')
      .sidebar({
        context: $(rootNode).find('.ui.bottom'),
        dimPage: false,
        // Every time the sidebar state changes, update this.state.filter.open.
        onVisible: function() {
          this.setState({filter: {open: true}});
        }.bind(this),
        onHide: function() {
          this.setState({filter: {open: false}});
        }.bind(this)
      });

    $(rootNode).find('.dashboard .main-content')
      .visibility({
        once: false,
        // update size when new content loads
        observeChanges: true,
        // load content on bottom edge visible
        onBottomVisible: function() {
          if (this.data.categories.length < this.data.numCategories)
            this.setState({categoryLimit: this.state.categoryLimit + 20});
        }.bind(this)
      })
    ;
  };

  /**
   * Toggles the filter menu sidebar.
   *
   * @private
   */
  _toggleFilterMenu() {
    // Same thing as before, might want to store this as a variable.
    let rootNode = ReactDOM.findDOMNode(this);
    $(rootNode).find('.ui.sidebar').sidebar('toggle');
  };


  /**
   * Toggles the google map view
   *
   * @private
   */
  _toggleMapView() {
    this.setState({mapView: !this.state.mapView});
  };


  /**
   * Sends the verification email when the user clicks the 'Send Again' button.
   *
   * @private
   */
  _sendEmailVerification() {
    this.setState({isSendingEmail: true});
    Meteor.call('resendEmailVerification', function(err, res) {
      if (!err) {
        this.setState({isSendingEmail: false});
        Alert.success('Email Sent!');
      } else {
        Alert.error('Could not resend email. Please try again later.')
      }
    }.bind(this))
  };


  /**
   * Gets the header for the page if the user is not verified.
   *
   * @returns {XML} - The header for the page.
   * @private
   */
  _getVerifyEmailHeader() {
    // If the user object isn't available yet, display a loading message.
    if (!this.props.currentUser) {
      return (
        <div className="ui text container middle aligned">
          <div className="ui active dimmer primary-color">
            <div className="ui large loader"></div>
          </div>
        </div>
      );
    }

    // Else, display the verify email message.
    return (
      <div className="ui text container center aligned masthead-center">
        <h2>An email was sent to {this.props.currentUser.emails[0].address}.</h2>
        <h4>Please follow the instructions to verify your email.</h4>
        <button className={"ui inverted button" + (this.state.isSendingEmail ? 'loading' : '')}
                onClick={this._sendEmailVerification.bind(this)}>
          Send Again
        </button>
      </div>
    )
  };


  /**
   * Shows the header content when the user is verified.
   *
   * @returns {XML} - The header content containing the featured events.
   * @private
   */
  _showHeadContent() {
    return <FeaturedEvents/>
  };


  /**
   * The callback function called when a user updates his/her preferences via the filters.
   *
   * @private
   */
  _filterChangeCallback() {
    this.setState({categoryLimit: 20});
  };


  /**
   *
   */
  _setLoadingCallback(isLoading) {
    this.setState({loading: isLoading});
  };


  _updateSearch(event) {
    Meteor.clearTimeout(this.searchTimeout);
    this.searchTimeout = Meteor.setTimeout(function() {
      this.setState({searchValue: event.target.value});
    }.bind(this), 1500);
  };


  /** @inheritDoc */
  render() {
    let mastheadContent = this.props.currentUser && isUserVerified(this.props.currentUser) ?
      this._showHeadContent() :
      this._getVerifyEmailHeader();

    let loading = this.state.loading ?
      <div className="ui active inverted dimmer">
        <div className="ui text large loader">Fetching Events...</div>
      </div> : null;

    let bottomLoader = this.data.categories.length < this.data.numCategories ?
      <div className="ui active centered inline text loader carousel-loader">
        Loading More Categories...
      </div> : null;

    let mapView = this.state.mapView ?
      (
        <MapView
          zoom={11}
          events={this.data.events}
        />
      ) : null;


    let content = this.state.searchValue && this.state.searchValue.length > 0 ?
      (   <div className="ui container" style={{display: this.state.mapView ? 'none' : 'block'}}>
          <h1 className="ui left floated header">
            {this.data.events && this.data.events.length > 0 ?
            'Showing results for "' + this.state.searchValue + '"' :
              'No events found'}

          </h1>
          <div className="ui clearing divider"></div>
          <EventGrid events={this.data.events}/>
        </div>
      ) :
      (
        <div style={{display: this.state.mapView ? 'none' : 'block'}}>
          <TopEventsCarousel sizes={{large: 4, medium: 2, small: 1}}
                             category={{
                                                    name: 'Top Events',
                                                    category_id: 'top_events',
                                                    subcategory: false
                                                }}
          />
          {_.map(this.data.categories, function(category) {
            return <EventCarousel key={category.category_id+'-dashboard-events'}
                                  sizes={{large: 4, medium: 2, small: 1}}
                                  category={category}
            />
          }.bind(this))}
          {bottomLoader}
        </div>
      );

    return (
      <div>
        <div className="ui inverted vertical segment dashboard-masthead primary-color">
          {mastheadContent}
        </div>
        <div className="ui menu attached secondary filter-menu">
          <div className="ui labeled icon menu">
            <a className={'item ' + (this.state.filter.open ? 'active' : '')}
               onClick={this._toggleFilterMenu.bind(this)}>
              <i className="options icon"/>
              Filters
            </a>
          </div>
          <div className="ui left menu">
            <div className="ui category search item">
              <div className="ui icon input">
                <input className="prompt" type="text" placeholder="Quick Search..."
                       onChange={this._updateSearch.bind(this)}/>
              </div>
            </div>
          </div>
          <div className="ui labeled icon right menu">
            <a className="item"
               onClick={this._toggleMapView.bind(this)}>
              <i className="map icon"/>
              {this.state.mapView ? 'Hide Map' : 'Show Map'}

            </a>
          </div>
        </div>
        <div className="ui bottom attached segment pushable" id="main-dashboard-container">
          <div className="ui left vertical sidebar menu">
            <Filters preferences={this.data.preferences}
                     categories={this.data.categories}
                     filterChangeCallback={this._filterChangeCallback.bind(this)}
                     setLoadingCallback={this._setLoadingCallback.bind(this)}
            />
          </div>

          <div className="dashboard pusher">


            <div className="ui basic segment main-content">
              {mapView}
              {loading || content}
            </div>
          </div>
        </div>
      </div>
    )
  }
}