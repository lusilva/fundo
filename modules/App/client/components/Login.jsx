/* global mui, React */

import Theme from '../theme';

const { TextField, Card, Styles, RaisedButton } = mui;

const Login = React.createClass({

    componentDidMount() {
        document.body.classList.add('dark-background');
    },

    componentWillUnmount() {
        document.body.classList.remove('dark-background');
    },

    _getStyles() {
        return {
            card: {
                maxWidth: '360px',
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
            },
            loginBtn: {
                width: '100%',
                marginTop: '15px',
                fontSize: '16px',
                fontWeight: '400',
                color: Theme.palette.alternateTextColor
            }
        }
    },

    render() {

        let styles = this._getStyles();

        return (
                <Card style={styles.card}>
                    <h1 style={styles.h1}>LOGIN</h1>
                    <div style={styles.formset}>
                        <TextField floatingLabelText="Email"/><br/>
                        <TextField floatingLabelText="Password" type="password"/><br/>
                        <br />
                        <RaisedButton label="Login" style={styles.loginBtn}
                                      backgroundColor={Theme.palette.primary2Color}
                                      labelColor={Theme.palette.alternateTextColor}
                        />
                    </div>
                    <div className="forgot">
                        <form className="forgot log-form">
                            <h3 className="caption">Forgot Password</h3>
                            <i className="close">&times;</i>
                            <div className="formset">
                                <div className="form-group">
                                    <lable className="form-label">User Name</lable>
                                    <input type="text" className="form-control"/>
                                </div>
                                <button type="submit" className="btn logs">Log in</button>
                            </div>
                        </form>
                    </div>
                </Card>
        );
    }
});

export default Login;