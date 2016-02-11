/* global React, mui */

import FullWidthSection from './FullWidthSection';
import Theme from '../theme';
import { History, Link } from 'react-router';

// Import components from Material-UI
const { Mixins, Styles, RaisedButton } = mui;
const { StylePropable, StyleResizable } = Mixins;
const { Typography } = Styles;

/**
 * The Home page React component, responsible for rendering the home page.
 * @class
 * @extends React.Component
 */
const Home = React.createClass({

    mixins: [
        StylePropable,
        StyleResizable,
        History
    ],

    // The list of words that the hero text will cycle through
    heroTextSelection: [
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
    ],
    // Needed to clear the interval after the component unmounts
    intervalId: null,

    // The time between word changes
    intervalTimeMS: 2000,

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
        }.bind(this), this.intervalTimeMS);
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
                backgroundColor: Theme.palette.primary1Color,
                overflow: 'hidden',
                fontFamily: Theme.fontFamily
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
            h1: {
                color: Theme.palette.alternateTextColor,
                fontWeight: Typography.fontWeightLight,
                fontSize: 26
            },
            nowrap: {
                whiteSpace: 'nowrap'
            },
            taglineWhenLarge: {
                marginTop: 16
            },
            h1WhenLarge: {
                fontSize: 56
            },
            registerStyle: {
                margin: '16px 32px 0px 32px'
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
                    <span style={styles.nowrap}>
                        <h1 style={styles.h1}>
                            {'is '}
                            <span style={{color: 'white'}}>
                                {this.heroTextSelection[this.state.heroTextIndex]}
                            </span>
                            {' made easy'}
                        </h1>
                    </span>
                    <Link to="/register">
                        <RaisedButton label="Get Started"
                                      linkButton={true}
                                      style={styles.registerStyle}/>
                    </Link>
                </div>
            </FullWidthSection>

        );
    },

    _getHomePagePurpose() {
        const styles = {
            root: {
                backgroundColor: Theme.palette.primary3Color
            },
            content: {
                maxWidth: 700,
                padding: 0,
                margin: '0 auto',
                fontWeight: Typography.fontWeightLight,
                fontSize: 20,
                lineHeight: '28px',
                paddingTop: 19,
                marginBottom: 13,
                letterSpacing: 0,
                color: Theme.palette.textColor
            }
        };

        return (
            <FullWidthSection
                style={styles.root}
                useContent={true}
                contentStyle={styles.content}
                contentType="p">
                Welcome to the ultimate event discovery tool. Our smart recommendation algorithms
                work hard to find events near you that you'll love. We do the thinking so you can focus on the doing.
            </FullWidthSection>
        );
    },

    /** @inheritdoc */
    render() {
        return (
            <div>
                {this._getHomePageHero()}
                {this._getHomePagePurpose()}
            </div>
        );
    }
});

export default Home;