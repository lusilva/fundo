/* global mui, React */

import Theme from '../theme';
import { History } from 'react-router';
import { userIsValid } from 'App/helpers';
import { ProgressButton } from './ProgressButton';

const { Card } = mui;

const Register = React.createClass({

    mixins: [
        History
    ],

    componentDidMount() {
        document.body.classList.add('dark-background');
    },

    componentWillUnmount() {
        document.body.classList.remove('dark-background');
    },

    getInitialState() {
        return {
            confirmEmail: Meteor.user() && !userIsValid(),
            resendButtonState: '',
            resendButtonLabel: 'Send Again'
        }
    },

    _getStyles() {
        return {
            card: {
                width: '360px',
                margin: '0 auto',
                textAlign: 'center',
                marginTop: '24px',
                height: '500px',
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

    _handleRedirect() {
        this.setState({confirmEmail: true});
    },

    _handleResendClick() {
        this.setState({resendButtonState: 'loading'});

        Meteor.call('resendEmailVerification', function(error) {
            this.setState({resendButtonState: 'disabled', resendButtonLabel: 'Email Sent!'});
        }.bind(this));
    },

    render() {

        let styles = this._getStyles();

        return this.state.confirmEmail ? (
            <Card style={styles.card}>
                <h1 style={styles.h1}>Confirm Email</h1> <br/>
                <div style={{padding: '50px 20px'}}>
                    <h2>An email was sent to {Meteor.user().emails[0].address}</h2>
                    <h2>please confirm your account</h2> <br/>
                    <ProgressButton
                        label={this.state.resendButtonLabel}
                        onClick={this._handleResendClick}
                        state={this.state.resendButtonState} />
                </div>
            </Card>
        ) : (
            <Card style={styles.card}>
                <h1 style={styles.h1}>Register</h1>
                <div style={styles.formset}>
                    <Accounts.ui.LoginFormSet redirect={this._handleRedirect} register={true}/>
                </div>
            </Card>
        );
    }
});

export default Register;