import Helmet from 'react-helmet';
import { History, Link } from 'react-router';
import ReactMixin from 'react-mixin';

import { userIsValid, getPathsForUser, pathIsValidForUser } from 'App/helpers';
import Logger from 'App/logger';

if (Meteor.isClient)
    require('App/lib/semantic-ui/definitions/modules/sidebar');


/**
 * The main Layout for the entire app.
 *
 * @className
 * @extends React.Component
 */
@ReactMixin.decorate(History)
export default class Layout extends React.Component {
    static propTypes = {
        children: React.PropTypes.any.isRequired
    };

    intervalId = null;

    handles = [];

    state = {
        appBarTitle: null,
        userIsValid: false
    };

    componentDidMount() {
        _.each(this.handles, function (handle) {
            handle.stop();
        });

        this.handles.push(Tracker.autorun(function () {
            let validPaths = getPathsForUser();
            for (var i = 0; i < validPaths.length; ++i) {
                if (this.history.isActive(validPaths[i].path)) {
                    return;
                }
            }
            if (this.state.userIsValid != userIsValid())
                this.setState({userIsValid: userIsValid()});
            this.history.pushState(this.state, validPaths[0].path);
        }.bind(this)));

        // Localize the selector instead of having jQuery search globally
        var rootNode = ReactDOM.findDOMNode(this);

        // Initialize the sidebar
        $(rootNode).find('.ui.sidebar').sidebar({
            context: $(rootNode)
        });
    };

    _toggleSideMenu() {
        // Same thing as before, might want to store this as a variable
        var rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.ui.sidebar').sidebar('toggle');
    };


    componentWillUnmount() {
        _.each(this.handles, function (handle) {
            handle.stop();
        });
    };

    _getSidebar() {
        console.log(this._getLinks('sidebar', 'active', 'item', this._toggleSideMenu.bind(this)));
        return this._getLinks('sidebar', 'active', 'item', this._toggleSideMenu.bind(this));
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
            <div className="ui inverted vertical center aligned segment">
                <div className="ui container">
                    <div className="ui large secondary inverted pointing menu">
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
                />

                <div className="ui vertical inverted sidebar menu">
                    {this._getSidebar()}
                </div>

                <div className="pusher">
                    {this._getNavBar()}
                    {this.props.children}

                    <div className="ui inverted vertical footer segment">
                        <div className="ui container">
                            <div className="ui stackable inverted divided equal height stackable grid">
                                <div className="three wide column">
                                    <h4 className="ui inverted header">About</h4>
                                    <div className="ui inverted link list">
                                        <a href="#" className="item">Sitemap</a>
                                        <a href="#" className="item">Contact Us</a>
                                        <a href="#" className="item">Religious Ceremonies</a>
                                        <a href="#" className="item">Gazebo Plans</a>
                                    </div>
                                </div>
                                <div className="three wide column">
                                    <h4 className="ui inverted header">Services</h4>
                                    <div className="ui inverted link list">
                                        <a href="#" className="item">Banana Pre-Order</a>
                                        <a href="#" className="item">DNA FAQ</a>
                                        <a href="#" className="item">How To Access</a>
                                        <a href="#" className="item">Favorite X-Men</a>
                                    </div>
                                </div>
                                <div className="seven wide column">
                                    <h4 className="ui inverted header">Footer Header</h4>
                                    <p>Extra space for a call to action inside the footer that could help re-engage
                                        users.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
