import Helmet from 'react-helmet';
import { History, Link } from 'react-router';
import ReactMixin from 'react-mixin';
import Alert from 'react-s-alert';

import { userIsValid, getPathsForUser, pathIsValidForUser } from 'App/helpers';
import Logger from 'App/logger';

if (Meteor.isClient) {
    require('App/lib/semantic-ui/definitions/modules/sidebar');
    require('App/lib/semantic-ui/definitions/modules/dimmer');
    require('App/lib/semantic-ui/definitions/modules/transition');
    require('App/lib/semantic-ui/definitions/modules/modal');
    require('App/lib/semantic-ui/definitions/behaviors/visibility');
}


/**
 * The main Layout for the entire app.
 *
 * @className
 * @extends React.Component
 */
@ReactMixin.decorate(History)
@ReactMixin.decorate(ReactMeteorData)
export default class Layout extends React.Component {
    static propTypes = {
        children: React.PropTypes.any.isRequired
    };

    intervalId = null;

    /**
     * Get the current user of the application, or null if no user is logged in.
     * This method is reactive and runs every time the user changes.
     * @returns {{currentUser: any}}
     */
    getMeteorData() {
        if (!!Meteor.user() != !!this.data.currentUser) {
            let paths = getPathsForUser();
            this.history.pushState(this.state, paths[0].path);
        }

        return {
            currentUser: Meteor.user()
        }
    };

    componentDidMount() {
        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        // Initialize the sidebar
        $(rootNode).find('#sidebar-menu')
            .sidebar({
                context: $(rootNode)
            })
            .sidebar('setting', 'transition', 'overlay');
    };

    _toggleSideMenu() {
        // Same thing as before, might want to store this as a variable
        var rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('#sidebar-menu').sidebar('toggle');
    };

    _getSidebar() {
        return this._getLinks('sidebar', 'active', 'ui inverted item large', this._toggleSideMenu.bind(this));
    };

    _getLinks(keyPrefix, activeClassName, className, onClickCallback) {
        return _.map(getPathsForUser(), function (path, index) {
            return (
                <Link to={path.path}
                      key={keyPrefix+index}
                      activeClassName={activeClassName}
                      className={className}
                      onClick={onClickCallback || function(){}}>{path.title}</Link>
            );
        }.bind(this))
    };

    _getNavBar() {
        let logo = null;

        if (!this.history.isActive('/')) {
            logo = (
                <Link to="/">
                    <img className="ui inverted item" src={require('./img/fundo-xsmall.png')}/>
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
                    script={
                        [
                            {"src": "https://maps.googleapis.com/maps/api/js?libraries=places", "type": "text/javascript"}
                        ]
                    }
                />

                <div className="ui vertical inverted sidebar menu primary-color" id="sidebar-menu">
                    {this._getSidebar()}
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
