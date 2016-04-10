import PreferenceSet from 'imports/collections/PreferenceSet';
import Event from 'imports/collections/Event';
import GeoSuggest from 'react-geosuggest';
import { Link } from 'react-router';

export default class Welcome extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  state = {
    loading: true,
    done: false,
    preferences: PreferenceSet.getCollection().findOne({userId: Meteor.userId()})
  };

  componentWillMount() {
    let that = this;
    let $script = require('scriptjs');
    $script("//maps.googleapis.com/maps/api/js?libraries=places", function() {
      that.setState({loading: false});
    });
  };

  /** @inheritDoc */
  componentDidMount() {
    // Add the dark purple background to the body, and remove it when
    // going to another page.
    document.body.classList.add('primary-color');
  };

  /** @inheritDoc */
  componentWillUnmount() {
    document.body.classList.remove('primary-color');
  };


  /**
   * Updates the user's location preference
   *
   * @param suggest {object} - The geosuggest suggest option.
   * @private
   */
  _updateUserLocation(suggest) {
    // Check is this is a valid place.
    if (!suggest.placeId && suggest.label != this.state.preferences.location) {
      this.refs.geosuggest.update(this.state.preferences.location || '');
      return;
    }
    // Get the user's preferences, and make sure this place is different then the user's current location.
    let preferences = this.state.preferences;
    if (preferences && preferences.location == suggest.label)
      return;

    // Show the loading spinner while preferences are updated on the server.
    preferences.location = suggest.label;
    let that = this;
    this.setState({loading: true});
    Meteor.call("updatePreferences", preferences, function(err, res) {
      if (!!res) {
        let handler = Meteor.setInterval(function() {
          JOB_QUEUE.getJob(res, function(err, job) {
            if (job.doc.status == 'completed') {
              Meteor.clearInterval(handler);
              that.setState({loading: false, done: true});
            }
          });
        }, 1000);
      } else {
        that.setState({loading: false, done: true});
      }
    });
  };


  render() {
    let geosuggest = !this.state.loading ?
      (
        <h2 className="ui icon header centered">
          <i className="circular map icon"/>
          <div className="content">
            Select A City
            <div className="sub header">
              Howdy! Before we can show you events, we need to know where you'd like to see events
              for.
            </div>
            <div className="ui item center">
              <GeoSuggest country="us"
                          types={['(cities)']}
                          autoActivateFirstSuggest={true}
                          onSuggestSelect={this._updateUserLocation.bind(this)}
                          ref='geosuggest'
              />
            </div>
          </div>
        </h2>
      ) : (
      <div className="ui active centered inline text large loader">
        Gettings things ready...
      </div>
    );

    let nextButton = this.state.done ? (
      <h2 className="ui icon header centered">
        <i className="circular map icon"/>
        <div className="content">
          Done!
          <div className="sub header">
            We've found some events for your area. You can always change your location in the filters
            menu on the dashboard.
          </div>
          <br/>
          <div className="ui item center">
            <Link to="/dashboard">
              <button className="ui animated button primary" tabIndex="0">
                <div className="content">Next</div>
              </button>
            </Link>
          </div>
        </div>
      </h2>
    ) : null;

    return (
      <div className="ui container">
        <div className="login-form">
          {nextButton || geosuggest}
        </div>
      </div>
    )
  }

}