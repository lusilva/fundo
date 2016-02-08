const { TextField, Card, Styles, RaisedButton } = mui;

const Login = React.createClass({


    _getStyles() {
        return {
            card: {
                maxWidth: '360px',
                margin: 'auto',
                textAlign: 'center',
                left: '0',
                right: '0',
                top: '75px',
                bottom: '0',
                height: '500px',
                position: 'absolute'
            },
            h1: {
                fontSize: '60px',
                margin: '25px 0 10px',
                display: 'inline-block',
                width: '100%',
                fontWeight: '200',
                color: Styles.Colors.lightBlue500
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
                color: '#fff'
            }
        }
    },

    render() {

        let styles = this._getStyles();

        return (
            <Card style={styles.card}>
                <h1 style={styles.h1}>Login</h1>
                <div style={styles.formset}>
                    <TextField floatingLabelText="Email"/><br/>
                    <TextField floatingLabelText="Password" type="password"/><br/>
                    <br />
                    <RaisedButton label="Login" style={styles.loginBtn} backgroundColor={Styles.Colors.lightBlue500} />
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
                <form className="twitter log-form">
                    <h3 className="caption fa fa-twitter"></h3>
                    <p>Login with Twitter</p><i className="close">&times;</i>
                    <div className="formset">
                        <div className="form-group">
                            <lable className="form-label">User Name</lable>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <lable className="form-label">Password</lable>
                            <input type="password" className="form-control"/>
                        </div>
                        <button className="btn">Log in</button>
                    </div>
                </form>
                <form className="google log-form">
                    <h3 className="caption fa fa-google-plus"></h3>
                    <p>Login with Google + </p><i className="close">&times;</i>
                    <div className="formset">
                        <div className="form-group">
                            <lable className="form-label">User Name</lable>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <lable className="form-label">Password</lable>
                            <input type="password" className="form-control"/>
                        </div>
                        <button className="btn">Log in</button>
                    </div>
                </form>
                <form className="facebook log-form">
                    <h3 className="caption fa fa-facebook"></h3>
                    <p>Login with Facebook </p><i className="close">&times;</i>
                    <div className="formset">
                        <div className="form-group">
                            <lable className="form-label">User Name</lable>
                            <input type="text" className="form-control"/>
                        </div>
                        <div className="form-group">
                            <lable className="form-label">Password</lable>
                            <input type="password" className="form-control"/>
                        </div>
                        <button type="submit" className="btn">Log in</button>
                    </div>
                </form>
            </Card>
        );
    }
});

export default Login;