import Helmet from 'react-helmet';
import { History } from 'react-router'
const { AppBar, Tabs, Tab, AppCanvas, Paper, Styles, Mixins } = mui;
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
            muiTheme: ThemeManager.getMuiTheme(Styles.LightRawTheme, {userAgent: 'all'})
        };
    },

    getInitialState() {
        return {
            showLeftNav: false,
            tabIndex: Session.get('tabIndex') || null,
            appBarTitle: null
        }
    },

    componentDidMount() {
        this._windowResizeHandler();
        $(window).resize(this._windowResizeHandler);
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

    _getTabs() {
        let styles = {
            root: {
                backgroundColor: Colors.lightBlue500,
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
                color: Colors.yellow500,
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
                backgroundColor: Colors.lightBlue500,
                color: Colors.yellow500,
                height: 64
            }
        };

        let tabs = !Meteor.userId() ?
            [
                { title: "Login", path: "/login" },
                { title: "Register", path: "/register" }

            ] :
            [
                // TODO: Logged in paths go here
            ];

        return (
            <div>
                <Paper
                    zDepth={0}
                    rounded={false}
                    style={styles.root}>

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
                    style={{backgroundColor: Colors.lightBlue500}}
                    onLeftIconButtonTouchTap={this._onLeftIconButtonTouchTap}/>
        );
    },

    render() {
        const style = {
            paddingTop: Spacing.desktopKeylineIncrement
        };
        console.log(style);
        return (
            <AppCanvas>
                <Helmet
                    title="fundo"
                    meta={
                        [
                            { name: 'description', content: 'Intelligent Event Recommendations' },
                            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
                        ]
                    }/>
                {this.state.showLeftNav ? this._getAppBar() : this._getTabs()}
                <div style={style}>
                    {this.props.children}
                </div>
            </AppCanvas>
        );
    }
});


export default Layout;
