/* global mui, React */

import Theme from '../theme';
import { History } from 'react-router';

const { Card } = mui;

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

    // Gets the styles for the card and font.
    _getStyles() {
        return {
            card: {
                width: '360px',
                margin: '0 auto',
                textAlign: 'center',
                marginTop: '24px',
                height: '500px',
                background: Theme.palette.primary3Color,
                position: 'absolute',
                left: '0',
                right: '0',
                fontFamily: Theme.fontFamily
            },
            h1: {
                fontSize: '60px',
                margin: '25px 0 10px',
                display: 'inline-block',
                width: '100%',
                fontWeight: '200',
                color: Theme.palette.textColor
            },
            formset: {
                padding: '25px',
                maxWidth: '320px',
                margin: 'auto'
            }
        }
    },

    // Handles the redirect upon successful login.
    _handleRedirect() {
        this.history.pushState(this.state, '/dashboard');
    },

    render() {

        let styles = this._getStyles();

        return (
            <Card style={styles.card}>
                <h1 style={styles.h1}>LOGIN</h1>
                <div style={styles.formset}>
                    {/* Get the login form from fundo/packages/meteor-accounts-react-material-ui */}
                   <Accounts.ui.LoginFormSet redirect={this._handleRedirect} login={true}/>
                </div>
            </Card>
        );
    }
});

export default Login;