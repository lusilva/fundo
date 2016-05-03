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


  /** @inheritDoc */
  render() {
    return (
      <div className="ui basic segment main-saved-events-content">
        <UserForm state={'changePwd'} />
      </div>
    )
  }
}