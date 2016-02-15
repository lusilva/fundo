/* global mui, React */

import { History } from 'react-router';


/**
 * The login view with the login form.
 *
 * @class
 * @extends React.Component
 */
const Login = React.createClass({

    // Allows for navigating to the dashboard upon form submission.
    mixins: [
        History
    ],

    // Add the dark purple background to the body, and remove it when
    // going to another page.
    componentDidMount() {
        document.body.classList.add('dark-background');
    },

    componentWillUnmount() {
        document.body.classList.remove('dark-background');
    },

    render() {
        return (<div>Login</div>);
    }
});

export default Login;