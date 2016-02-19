/* global React */

import { isUserVerified } from 'App/helpers';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
const Dashboard = React.createClass({
    render() {
        if (isUserVerified(this.props.currentUser)) {
            return (
                <div>
                    dashboard
                </div>
            );
        } else {
            return (
                <div>
                    Please verify your email
                </div>
            )
        }
    }
});

export default Dashboard;