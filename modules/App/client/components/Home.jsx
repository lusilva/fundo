
const { Mixins, Styles, FlatButton } = mui;
import FullWidthSection from './FullWidthSection';

const { StylePropable, StyleResizable } = Mixins;
const { Colors, Spacing, Typography, lightBaseTheme } = Styles;

const Home = React.createClass({

    mixins: [
        StylePropable,
        StyleResizable
    ],

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
                    <h1 style={styles.h1}>Find nearby <span style={{color: '#ff0000' }}>festivals</span></h1>
                </div>
            </FullWidthSection>
        );
    },

    render() {
        const style = {
            paddingTop: Spacing.desktopKeylineIncrement
        };

        return (
            <div style={style}>
                <FlatButton label="Default"/>
                {this._getHomePageHero()}
            </div>
        );
    }
});

export default Home;