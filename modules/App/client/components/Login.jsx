/* global mui, React */

import ReactMixin from 'react-mixin';
import { History } from 'react-router';


const LoginForm = BlazeToReact('fullPageAtForm');


/**
 * The login view with the login form.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(History)
export default class Login extends React.Component {

    // Add the dark purple background to the body, and remove it when
    // going to another page.
    componentDidMount() {
        document.body.classList.add('primary-color');
    };

    componentWillUnmount() {
        document.body.classList.remove('primary-color');
    };

    render() {
        return (
            <div className="ui container">
                <div className="login-form">
                    <LoginForm/>
                </div>
            </div>
        );
    }
}