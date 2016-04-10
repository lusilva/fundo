/* global Meteor ReactMeteorData */

import Helmet from 'react-helmet';
import { Link } from 'react-router';
import ReactMixin from 'react-mixin';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import Alert from 'react-s-alert';
import _ from 'lodash';

import { getPathsForUser } from 'imports/helpers';
import Logger from 'imports/logger';


/**
 * The main Layout for the entire app.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(ReactMeteorData)
@ReactMixin.decorate(PureRenderMixin)
export default class Layout extends React.Component {
  static propTypes = {
    children: React.PropTypes.any.isRequired
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };


  /**
   * Get the current user of the application, or null if no user is logged in.
   * This method is reactive and runs every time the user changes.
   *
   * @returns {{currentUser: ?Meteor.user}} The current logged-in user.
   */
  getMeteorData() {
    return {
      currentUser: Meteor.user()
    }
  };


  /** @inheritDoc */
  componentWillMount() {
    // Require all necessary semantic-ui modules.
    require('imports/lib/semantic-ui/definitions/modules/sidebar');
    require('imports/lib/semantic-ui/definitions/modules/dimmer');
    require('imports/lib/semantic-ui/definitions/modules/transition');
    require('imports/lib/semantic-ui/definitions/modules/modal');
    require('imports/lib/semantic-ui/definitions/modules/popup');
    require('imports/lib/semantic-ui/definitions/modules/dropdown');
    require('imports/lib/semantic-ui/definitions/behaviors/visibility');
  };


  /** @inheritDoc */
  componentDidMount() {
    // Localize the selector instead of having jQuery search globally
    var rootNode = ReactDOM.findDOMNode(this);

    // Initialize the sidebar
    $(rootNode).find('#sidebar-menu')
      .sidebar({
        context: $(rootNode)
      })
      .sidebar('setting', 'transition', 'overlay');

    // Listen to the log in event, and redirect the user to the dashboard.
    AccountsEvents.on('loggedIn', function() {
      Logger.debug('Logged In! Redirecting to /dashboard');
      this.context.router.replace('/dashboard');
    }.bind(this));
  };


  /**
   * Toggles the sidebar menu in mobile view.
   *
   * @private
   */
  _toggleSideMenu() {
    // Same thing as before, might want to store this as a variable
    var rootNode = ReactDOM.findDOMNode(this);
    $(rootNode).find('#sidebar-menu').sidebar('toggle');
  };


  /**
   * Get the links for the sidebar.
   *
   * @returns {Array.<!React.Component>}
   * @private
   */
  _getSidebarContent() {
    return this._getLinks('sidebar', 'active', 'ui inverted item large', this._toggleSideMenu.bind(this));
  };


  /**
   * Get the navbar component.
   *
   * @returns {!React.Component} The navbar component, with all navigation links.
   * @private
   */
  _getNavBar() {
    let logo = null;

    // If we are not on the home page, then display the small logo.
    if (!this.context.router.isActive('/')) {
      logo = (
        <Link to="/">
          <img className="ui inverted item" src={require('../img/fundo-xsmall.png')}/>
        </Link>
      )
    }

    return (
      <div className="ui inverted vertical center aligned segment primary-color">
        <div className="ui container primary-color">
          <div className="ui large secondary inverted pointing menu primary-color">
            <div className="toc item" onClick={this._toggleSideMenu.bind(this)}>
              <i className="sidebar icon"/>
            </div>
            {logo}
            <div className="right item">
              {this._getLinks('navbar', 'active', 'ui inverted item', null)}
            </div>
          </div>
        </div>
      </div>
    )
  };


  /**
   * Get links for the current user, depending on what pages the user
   * is allowed to see.
   *
   * @param {string} keyPrefix - The prefix for the React key prop for the links.
   * @param {string} activeClassName - The name of the class that an active link has.
   * @param {string} className - The name of the class that a link has.
   * @param {func} onClickCallback - The callback function for clicking a link.
   * @returns {Array.<Link>} - An array of link components.
   * @private
   */
  _getLinks(keyPrefix, activeClassName, className, onClickCallback) {
    return _.map(getPathsForUser(), function(path, index) {
      return (
        <Link to={path.path}
              key={keyPrefix+index}
              activeClassName={activeClassName}
              className={className}
              onClick={onClickCallback || function(){}}>{path.title}</Link>
      );
    }.bind(this))
  };


  /** @inheritDoc */
  render() {
    return (
      <div>
        <Helmet
          title="fundo"
          meta={
                        [
                            { name: 'description', content: 'Intelligent Event Recommendations' },
                            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
                        ]
                    }
          link={
                        [
                            {"rel": "stylesheet", "type":"text/css",
                             "href": "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.3.15/slick.css"}
                        ]
                    }
        />

        <div className="ui vertical inverted sidebar menu primary-color" id="sidebar-menu">
          {this._getSidebarContent()}
        </div>

        <div className="pusher">
          {this._getNavBar()}
          {React.Children.map(this.props.children, (child) => {
            return React.cloneElement(child, {currentUser: this.data.currentUser});
          })}

          <div className="ui inverted vertical footer segment primary footer">
            <div className="ui container">
              <div className="ui stackable inverted divided equal height stackable grid">
                <div className="three wide column">
                  <h4 className="ui inverted header">Created @ RCOS</h4>
                  <div className="ui inverted link list">
                    <a href="https://rcos.io" className="item">RCOS Website</a>
                    <a href="https://github.com/lusilva/fundo" className="item">GitHub</a>
                  </div>
                </div>
                <div className="seven wide column">
                  <h4 className="ui inverted header">Who We Are</h4>
                  <p>fundo was developed with love by students at Rensselaer Polytechnic
                    Institute.<br/>
                    Interface graphic by <a href="http://www.freepik.com/">Freepik</a> from <a
                      href="http://www.flaticon.com/">Flaticon</a> is licensed under <a
                      href="http://creativecommons.org/licenses/by/3.0/"
                      title="Creative Commons BY 3.0">CC BY 3.0</a>. Made with <a
                      href="http://logomakr.com" title="Logo Maker">Logo Maker</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Alert stack={{limit: 3}} effect='slide' position='top-right'/>
      </div>
    );
  }
}
