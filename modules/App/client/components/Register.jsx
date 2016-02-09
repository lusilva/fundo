/* global mui, React */

import Theme from '../theme';
import { History } from 'react-router';

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

    _handleRedirect() {
        this.history.pushState(this.state, '/dashboard');
    },

    render() {

        let styles = this._getStyles();

        return (
            <Card style={styles.card}>
                <h1 style={styles.h1}>REGISTER</h1>
                <div style={styles.formset}>
                    <Accounts.ui.LoginFormSet redirect={this._handleRedirect} register={true}/>
                </div>
            </Card>
        );
    }
});

export default Register;