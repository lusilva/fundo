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
import MainMenu from '../menus/MainMenu';

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
    categoryLimit: 10,
    searchValue: null,
    mapView: false
  };

  eventSub = null;

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
    this.eventSub = Meteor.subscribe('events');
    Meteor.subscribe('categories');

    // Find the preference set for the current user.
    let preferences = PreferenceSet.getCollection().findOne({userId: Meteor.userId()});

    let events = [];
      // Checks to see if there is text in the search box
    if (this.state.searchValue && this.state.searchValue.length > 0) {
        //console.log(this.state.searchValue);
      events = _.map(Event.getSearchIndex().search(this.state.searchValue).fetch(), function(event) {
        return new Event(event);
      });
      events = _.filter(events, function(event) {
        return _.indexOf(event.relevant_cities, preferences.location) > -1 && event.start_time.getTime() > new Date().getTime();
      });
        //Runs if there is nothing in the search box
    } else {
        //console.log("No search");
      events = Event.getCollection().find({
        // Get events in the user's city.
        relevant_cities: {
          $in: [preferences.location]
        },
          categories: {
              $in: [preferences.categories]
          },
        start_time: {
          $gt: new Date()
        }
      }, {reactive: false}).fetch();
    }

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
      });
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
    return <FeaturedEvents city={this.data.preferences.location}/>
  };


  /**
   * The callback function called when a user updates his/her preferences via the filters.
   *
   * @private
   */
  _filterChangeCallback() {
    if (this.eventSub) this.eventSub.stop();
    this.setState({categoryLimit: 10});
  };


  _setLoadingCallback(isLoading) {
    this.setState({loading: isLoading});
  };


  _updateSearch(newValue) {
    this.setState({searchValue: newValue});
  };


  /** @inheritDoc */
  render() {
    let mastheadContent = this.props.currentUser && isUserVerified(this.props.currentUser) ?
      this._showHeadContent() :
      this._getVerifyEmailHeader();

    let loading = this.state.loading || this.data.categories.length == 0 ?
      <div className="ui active inverted dimmer">
        <div className="ui text large loader">{this.state.loading ? 'Fetching Events...' : 'Getting Ready...'}</div>
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
            'Showing ' + this.data.events.length + ' results for "' + this.state.searchValue + '"' :
            'No events found for "' + this.state.searchValue + '"'}

          </h1>
          <div className="ui clearing divider"></div>
          <EventGrid events={this.data.events}/>
        </div>
      ) :
      (
        <div style={{display: this.state.mapView ? 'none' : 'block'}}>
          <TopEventsCarousel sizes={{large: 4, medium: 2, small: 1}}
                             city={this.data.preferences.location}
                             category={{
                                                    name: 'Top Events',
                                                    category_id: 'top_events',
                                                    subcategory: false
                                                }}
          />
          {_.map(this.data.categories, function(category) {
            return <EventCarousel key={category.category_id+'-dashboard-events'}
                                  city={this.data.preferences.location}
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
        <MainMenu filter={this.state.filter}
                  mapView={this.state.mapView}
                  filterMenuCallback={this._toggleFilterMenu.bind(this)}
                  searchInputChangeCallback={_.throttle(this._updateSearch.bind(this), 1000)}
                  mapViewCallback={this._toggleMapView.bind(this)}
        />

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
              {!this.state.loading ? mapView : null}
              {loading || content}
            </div>
          </div>
        </div>
      </div>
    )
  }
}