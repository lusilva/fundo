/* global React */


import FullWidthSection from './FullWidthSection';
import Theme from '../theme';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
const Dashboard = React.createClass({

    _getHero() {
        let styles = {
            root: {
                backgroundColor: Theme.palette.primary1Color,
                overflow: 'hidden',
                fontFamily: Theme.fontFamily
            }
        };

        return (
            <FullWidthSection style={styles.root}>
                <h1>User Dashboard</h1>
            </FullWidthSection>
        );
    },


    render() {
        return (
            <div>
                {this._getHero()}
            </div>
        );
    }
});

export default Dashboard;