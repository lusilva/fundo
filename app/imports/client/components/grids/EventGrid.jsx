/* global React, Meteor */

import Alert from 'react-s-alert';
import _ from 'lodash';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import ReactMixin from 'react-mixin';

import GridEvent from '../events/GridEvent';

/**
 * The grid view of all the events at the bottom of the dashboard.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class EventGrid extends React.Component {

  static propTypes = {
    events: React.PropTypes.array.isRequired
  };

  state = {
    preferences: null
  };

  render() {
    return (
      <div className="ui container">
        <div className="ui four stackable doubling cards">
          {_.map(this.props.events, function(event) {
            return (
              <GridEvent key={'grid-' + event.id}
                         event={event}/>);
          })}
        </div>
      </div>
    )
  }

}