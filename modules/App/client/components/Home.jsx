/* global React, mui */

import FullWidthSection from './FullWidthSection';

// Import components from Material-UI
const { Mixins, Styles } = mui;
const { StylePropable, StyleResizable } = Mixins;
const { Colors, Spacing, Typography, lightBaseTheme } = Styles;

/**
 * The Home page React component, responsible for rendering the home page.
 * @class
 * @extends React.Component
 */
const Home = React.createClass({

    mixins: [
        StylePropable,
        StyleResizable
    ],

    // The list of words that the hero text will cycle through
    heroTextSelection: [
        'festivals',
        'concerts',
        'comedy',
        'sports',
        'family',
        'nightlife',
        'organizations',
        'conferences',
        'food',
        'sales',
        'museums',
        'movies',
        'hiking'
    ],
    // Needed to clear the interval after the component unmounts
    intervalId: null,

    /**
     * Returns the initial state of this component.
     * @returns {{heroTextIndex: number}}
     */
    getInitialState() {
        this.heroTextSelection.sort(function (a, b) {
            return b.length - a.length; // ASC -> a - b; DESC -> b - a
        });

        return {
            heroTextIndex: 0
        }
    },

    /** @inheritdoc */
    componentDidMount() {
        this.intervalId = Meteor.setInterval(function () {
            let nextIndex = this.state.heroTextIndex + 1;
            this.setState({
                heroTextIndex: (nextIndex >= this.heroTextSelection.length ? 0 : nextIndex)
            });
        }.bind(this), 1000);
    },

    /** @inheritdoc */
    componentWillUnmount() {
        if (this.intervalId)
            Meteor.clearInterval(this.intervalId);
    },

    /**
     * Gets the properly styled hero component for the home page
     * @returns {XML}
     * @private
     */
    _getHomePageHero() {
        let styles = {
            root: {
                backgroundColor: Colors.lightBlue500,
                overflow: 'hidden'
            },
            svgLogo: {
                margin: '0 auto',
                display: 'block'
            },
            tagline: {
                margin: '16px auto 0 auto',
                textAlign: 'center',
                maxWidth: 575
            },
            label: {
                color: lightBaseTheme.palette.primary1Color
            },
            githubStyle: {
                margin: '16px 32px 0px 8px'
            },
            demoStyle: {
                margin: '16px 32px 0px 32px'
            },
            h1: {
                color: Colors.darkWhite,
                fontWeight: Typography.fontWeightLight,
                fontSize: 30
            },
            nowrap: {
                whiteSpace: 'nowrap'
            },
            taglineWhenLarge: {
                marginTop: 32
            },
            h1WhenLarge: {
                fontSize: 56
            }
        };

        styles.h2 = this.mergeStyles(styles.h1, styles.h2);

        if (this.isDeviceSize(StyleResizable.statics.Sizes.LARGE)) {
            styles.tagline = this.mergeStyles(styles.tagline, styles.taglineWhenLarge);
            styles.h1 = this.mergeStyles(styles.h1, styles.h1WhenLarge);
        }

        return (
            <FullWidthSection style={styles.root}>
                <img style={styles.svgLogo} src={require('../img/fundo.png')}/>
                <div style={styles.tagline}>
                    <h1 style={styles.h1}>Find nearby <span style={{color: "#ff0000"}}>
                            {this.heroTextSelection[this.state.heroTextIndex]}
                        </span>
                    </h1>
                </div>
            </FullWidthSection>
        );
    },

    /** @inheritdoc */
    render() {
        const style = {
            paddingTop: Spacing.desktopKeylineIncrement
        };

        return (
            <div style={style}>
                {this._getHomePageHero()}
            </div>
        );
    }
});

export default Home;