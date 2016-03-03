/* global mui, React */

import ReactMixin from 'react-mixin';


const LoginForm = BlazeToReact('fullPageAtForm');


/**
 * The login view with the login form.
 *
 * @class
 * @extends React.Component
 */
export default class Login extends React.Component {

    /** @inheritDoc */
    componentDidMount() {
        // Add the dark purple background to the body, and remove it when
        // going to another page.
        document.body.classList.add('primary-color');
    };

    /** @inheritDoc */
    componentWillUnmount() {
        document.body.classList.remove('primary-color');
    };

    /** @inheritDoc */
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