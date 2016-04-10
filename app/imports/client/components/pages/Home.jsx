/* global React, mui */

import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import { Link } from 'react-router';


/**
 * The Home page React component, responsible for rendering the home page.
 * @className
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class Home extends React.Component {

  // The list of words that the hero text will cycle through
  heroTextSelection = [
    'festivals',
    'concerts',
    'comedy',
    'sports',
    'nightlife',
    'conferences',
    'shopping',
    'museums',
    'movies',
    'hiking',
    'music',
    'dating',
    'restaurants'
  ];

  // Needed to clear the interval after the component unmounts
  intervalId = null;

  // The time between word changes
  intervalTimeMS = 2000;

  /**
   * Returns the initial state of this component.
   * @returns {{heroTextIndex: number}}
   */
  state = {
    heroTextIndex: 0
  };

  componentWillMount() {
    this.heroTextSelection.sort(function(a, b) {
      return b.length - a.length; // ASC -> a - b; DESC -> b - a
    });
  };

  /** @inheritdoc */
  componentDidMount() {
    this.intervalId = Meteor.setInterval(function() {
      let nextIndex = this.state.heroTextIndex + 1;
      this.setState({
        heroTextIndex: (nextIndex >= this.heroTextSelection.length ? 0 : nextIndex)
      });
    }.bind(this), this.intervalTimeMS);
  };

  /** @inheritdoc */
  componentWillUnmount() {
    if (this.intervalId)
      Meteor.clearInterval(this.intervalId);
  };

  /** @inheritdoc */
  render() {
    return (
      <div>
        <div className="ui inverted vertical center aligned segment masthead primary-color">
          <div className="ui text container middle aligned">
            <div className="ui middle aligned large image">
              <img src={require("imports/client/img/fundo.png")}/>
            </div>
            <h2>is {this.heroTextSelection[this.state.heroTextIndex]} made easy</h2>
          </div>
        </div>
      </div>
    );
  };
}