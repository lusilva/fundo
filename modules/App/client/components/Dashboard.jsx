/* global React */

import { userIsValid } from 'App/helpers';

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
const Dashboard = React.createClass({

    getInitialState() {
        return {
            userIsValid: userIsValid()
        }
    },

    render() {
        if (this.state.userIsValid) {
            return (
                <div>
                    dashboard
                </div>
            );
        } else {
            return (
                <div>Please verify your email</div>
            )
        }
    }
});

export default Dashboard;