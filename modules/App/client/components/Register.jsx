/* global mui, React */

import { History } from 'react-router';
import { userIsValid } from 'App/helpers';


const Register = React.createClass({

    mixins: [
        History
    ],

    handlers: [],

    componentDidMount() {
        document.body.classList.add('dark-background');

        this.handlers.push(Tracker.autorun(function () {
            if (Meteor.userId() && !userIsValid())
                this.setState({confirmEmail: true});
        }.bind(this)));

    },

    componentWillUnmount() {
        this.handlers.forEach(function (handler) {
            handler.stop();
        });

        document.body.classList.remove('dark-background');
    },

    getInitialState() {
        return {
            confirmEmail: false
        }
    },

    render() {
        return (<div>test</div>);
    }
});

export default Register;