import Helmet from 'react-helmet';
import { History, Link } from 'react-router';
import Theme from './theme';

import { userIsValid, getPathsForUser } from 'App/helpers';
import Logger from 'App/logger';


const { AppBar, Tabs, Tab, AppCanvas, Paper, Styles, Mixins, LeftNav, MenuItem, IconMenu, IconButton, SvgIcons } = mui;
const { NavigationMoreVert } = SvgIcons;
const { ThemeManager, Spacing, Typography } = Styles;

/**
 * The main Layout for the entire app.
 *
 * @class
 * @extends React.Component
 */
const Layout = React.createClass({
    propTypes: {
        children: React.PropTypes.any.isRequired
    },

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    intervalId: null,

    handles: [],

    mixins: [
        Mixins.StylePropable,
        History
    ],


    getChildContext() {
        // Need to set the userAgent here for SSR in production.
        return {
            muiTheme: ThemeManager.getMuiTheme(Theme, {userAgent: 'all'})
        };
    },

    getInitialState() {
        return {
            showLeftNav: true,
            appBarTitle: null,
            open: false
        }
    },

    componentDidMount() {
        _.each(this.handles, function (handle) {
            handle.stop();
        });

        this._windowResizeHandler();
        $(window).resize(this._windowResizeHandler);


        this.handles.push(Tracker.autorun(function () {
            if (userIsValid()) {
                this.history.pushState(this.state, '/dashboard');
            } else if (!!Meteor.userId()) {
                this.history.pushState(this.state, '/register');
            } else {
                this.history.pushState(this.state, '/');
            }
        }.bind(this)));

        Logger.debug('Layout component mounted!');
    },

    componentWillUnmount() {
        _.each(this.handles, function (handle) {
            handle.stop();
        });

        Logger.debug('Layout component unmounted!');
    },

    _windowResizeHandler() {
        let shouldShowLeftNav = $(window).width() <= 768;
        if (shouldShowLeftNav != this.state.showLeftNav)
            this.setState({showLeftNav: shouldShowLeftNav});
    },

    _onLeftIconButtonTouchTap(event) {
        if (this.state.showLeftNav) {
            this.setState({open: true});
            event.preventDefault();
        }
    },

    _onTabChange(value, e, tab) {
        this.history.pushState(this.state, tab.props.path);
    },

    _getIcon(styles) {
        if (!userIsValid() || this.history.isActive('/'))
            return null;
        return (
            <Link to='/'>
                <span style={this.prepareStyles(styles.span)}>
                    <img src={require('./img/fundo-xsmall.png')}/>
                </span>
            </Link>
        );
    },

    _getIconMenu() {
        if (!userIsValid())
            return null;
        return (
            <IconMenu
                iconButtonElement={<IconButton><NavigationMoreVert/></IconButton>}
                iconStyle={{width: 'auto', height: "34px", fill: Theme.palette.accent1Color}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                style={{float: 'right', top: '5px', right: '10px', position: 'absolute'}}
            >
                <MenuItem onTouchTap={Meteor.logout} primaryText="Sign out"/>
            </IconMenu>)
    },

    _getTabs(tabs, activeTab) {
        let styles = {
            root: {
                position: 'fixed',
                height: 64,
                top: 0,
                right: 0,
                zIndex: 4,
                width: '100%',
                backgroundColor: Theme.palette.primary1Color
            },
            container: {
                position: 'absolute',
                right: (Spacing.desktopGutter / 2) + 48,
                bottom: 0,
                backgroundColor: Theme.palette.primary1Color
            },
            span: {
                fontWeight: Typography.fontWeightLight,
                left: 25,
                top: 5,
                position: 'absolute',
                fontSize: 26
            },
            tabs: {
                width: 425,
                bottom: 0
            },
            tab: {
                height: 64
            }
        };

        return (
            <div>
                <Paper
                    zDepth={0}
                    rounded={false}
                    style={styles.root}>

                    {this._getIcon(styles)}

                    <div style={this.prepareStyles(styles.container)}>
                        <Tabs
                            style={styles.tabs}
                            value={activeTab.toString()}
                            onChange={this._onTabChange}>
                            {_.map(tabs, function (item, index) {
                                return (
                                    <Tab key={index}
                                         value={index.toString()}
                                         label={item.title}
                                         style={styles.tab}
                                         path={item.path}/>
                                );
                            })}
                        </Tabs>
                    </div>
                    {this._getIconMenu()}
                </Paper>
            </div>
        );
    },

    _onMenuItemClick(value, index) {
        this.history.pushState(this.state, value.path);
        this.setState({open: false});
    },

    _getAppBar(paths, activePath) {
        return (
            <div>
                <AppBar title={this.state.appBarTitle}
                        onLeftIconButtonTouchTap={this._onLeftIconButtonTouchTap}
                        iconElementRight={this._getIconMenu()}
                />
                <LeftNav docked={false} width={250} open={this.state.open}
                         style={{backgroundColor: Theme.palette.primary1Color,
                                color: Theme.palette.alternateTextColor}}
                         onRequestChange={open => this.setState({open})}>
                    <Paper zDepth={0}
                           style={{backgroundColor: Theme.palette.primary3Color,
                                color: Theme.palette.alternateTextColor,
                                height: '64px', textAlign: 'center'}}>
                        <img src={require('./img/fundo-xsmall.png')} style={{padding: '5px'}}/>
                    </Paper>
                    {_.map(paths, function (value, index) {
                        let color = activePath == index ?
                            Theme.palette.alternateTextColor :
                            Theme.palette.canvasColor;
                        return (
                            <MenuItem key={index}
                                      style={{color: color, fontSize: '20px', padding: '10px 0'}}
                                      onTouchTap={this._onMenuItemClick.bind(this, value, index)}>
                                {value.title}
                            </MenuItem>
                        );
                    }.bind(this))}
                </LeftNav>
            </div>
        );
    },

    render() {
        const style = {
            paddingTop: this.state.showLeftNav ? '0' : Spacing.desktopKeylineIncrement
        };

        let tabs = getPathsForUser();
        let activeTab = 0;
        _.forEach(tabs, function(o, index) {
            if (this.history.isActive(o.path))
                activeTab = index;
        }.bind(this));

        return (
            <AppCanvas>
                <Helmet
                    title="fundo"
                    meta={
                        [
                            { name: 'description', content: 'Intelligent Event Recommendations' },
                            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
                        ]
                    }
                    link={[
                        {"rel": "stylesheet", "href": "https://fonts.googleapis.com/css?family=Roboto:400,300,500"}
                    ]}
                />
                {this.state.showLeftNav ? this._getAppBar(tabs, activeTab) : this._getTabs(tabs, activeTab)}
                <Accounts.ui.Dialogs />
                <div style={style}>
                    {this.props.children}
                </div>
            </AppCanvas>
        );
    }
});


export default Layout;
