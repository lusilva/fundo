import Helmet from 'react-helmet';
import { History, Link } from 'react-router';
import Theme from './theme';
import Paths from './paths';
const { AppBar, Tabs, Tab, AppCanvas, Paper, Styles, Mixins, Utils } = mui;
const { ThemeManager, Colors, Spacing, Typography } = Styles;


const Layout = React.createClass({
    propTypes: {
        children: React.PropTypes.any.isRequired
    },

    childContextTypes: {
        muiTheme: React.PropTypes.object
    },

    intervalId: null,

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
        let tabIndex = null;
        if (Meteor.isClient && Session)
            tabIndex = Session.get('activePath');


        return {
            showLeftNav: false,
            tabIndex: tabIndex,
            appBarTitle: null
        }
    },

    componentDidMount() {
        this._windowResizeHandler();
        $(window).resize(this._windowResizeHandler);

        // Add this here as a guard against SSR since Session doesn't exist in the server.
        if (Meteor.isClient && Session) {
            Tracker.autorun(function () {
                let tabIndex = Session.get('activePath');
                if (typeof null != tabIndex && tabIndex.toString() !== this.state.tabIndex)
                    this.setState({tabIndex: tabIndex.toString()});
            }.bind(this));
        }
    },

    _windowResizeHandler() {
        let shouldShowLeftNav = $(window).width() <= 768;
        if (shouldShowLeftNav != this.state.showLeftNav)
            this.setState({showLeftNav: shouldShowLeftNav});

    },

    _onLeftIconButtonTouchTap(event) {
        if (this.state.showLeftNav) {
            this.refs.sideNav.toggle();
            event.preventDefault();
        }
    },

    _onTabChange(value, e, tab) {
        this.history.pushState(this.state, tab.props.path);
        this.setState({tabIndex: value});
    },

    _onIconSelect() {
        this.setState({tabIndex: '0'});
    },

    _getIcon(styles) {
        if (this.state.tabIndex == '0')
            return null;
        return (
            <Link to='/' onClick={this._onIconSelect}>
                <span style={this.prepareStyles(styles.span)}>
                    <img src={require('./img/fundo-xsmall.png')}/>
                </span>
            </Link>
        );
    },

    _getTabs() {
        let styles = {
            root: {
                position: 'fixed',
                height: 64,
                top: 0,
                right: 0,
                zIndex: 4,
                width: '100%'
            },
            container: {
                position: 'absolute',
                right: (Spacing.desktopGutter / 2) + 48,
                bottom: 0
            },
            span: {
                fontWeight: Typography.fontWeightLight,
                left: 45,
                top: 22,
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

        let tabs = Meteor.userId() ? Paths.loggedIn : Paths.loggedOut;

        return (
            <div>
                <Paper
                    zDepth={0}
                    rounded={false}
                    style={styles.root}>

                    {this._getIcon(styles)}
                    {/*<span style={this.prepareStyles(styles.span)}> &Sigma;&Chi; at Rensselaer </span>*/}

                    <div style={this.prepareStyles(styles.container)}>
                        <Tabs
                            style={styles.tabs}
                            value={this.state.tabIndex}
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
                </Paper>
            </div>
        );
    },

    _getAppBar() {
        return (
            <AppBar title={this.state.appBarTitle}
                    onLeftIconButtonTouchTap={this._onLeftIconButtonTouchTap}/>
        );
    },

    render() {
        const style = {
            paddingTop: Spacing.desktopKeylineIncrement
        };

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
                {this.state.showLeftNav ? this._getAppBar() : this._getTabs()}
                <div style={style}>
                    {this.props.children}
                </div>
            </AppCanvas>
        );
    }
});


export default Layout;
