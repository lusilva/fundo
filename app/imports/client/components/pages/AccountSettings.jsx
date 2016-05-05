/* global React, Meteor, ReactMeteorData */

import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

const UserForm = BlazeToReact('atForm');

/**
 * The MyEvents view displaying the user's liked events.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class AccountSettings extends React.Component {

  /**
   * The props that this component expects.
   *
   * @type {{currentUser: *}}
   */
  static propTypes = {
    currentUser: React.PropTypes.object
  };

  _clearRecommendations() {
    // TODO: implement code to delete recommended events.  This shoudl unlike/dislike all past events
    alert("Warning, this will remove all recommended events.");
  }

  /** @inheritDoc */
  render() {
    return (
      <div className="ui container center aligned">
        <div className="ui basic segment">
          <UserForm state={'changePwd'} />
        </div>
        <h1>Clear Recommendations</h1>
        <button className="negative ui button" onClick={this._clearRecommendations.bind(this)}>
          Clear Recommendations
        </button>
      </div>
      
    )
  }
}