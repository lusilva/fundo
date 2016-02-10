/* global React */


const { FlatButton, CircularProgress } = mui;

export const STATE = {
    LOADING: 'loading',
    DISABLED: 'disabled',
    SUCCESS: 'success',
    ERROR: 'error',
    NOTING: ''
};

/**
 * The dashboard view that the user sees upon logging in.
 *
 * @class
 * @extends React.Component
 */
export const ProgressButton = React.createClass({
    propTypes: {
        durationError: React.PropTypes.number,
        label: React.PropTypes.string.isRequired,
        durationSuccess: React.PropTypes.number,
        onClick: React.PropTypes.func,
        onError: React.PropTypes.func,
        onSuccess: React.PropTypes.func,
        state: React.PropTypes.oneOf(Object.keys(STATE).map(k => STATE[k])),
        shouldAllowClickOnLoading: React.PropTypes.bool,
        style: React.PropTypes.object
    },

    getDefaultProps () {
        return {
            durationError: 1200,
            durationSuccess: 500,
            onClick () {
            },
            onError () {
            },
            onSuccess () {
            },
            shouldAllowClickOnLoading: false
        }
    },

    getInitialState () {
        return {
            currentState: this.props.state || STATE.NOTHING
        }
    },

    componentWillReceiveProps (nextProps) {
        if (nextProps.state === this.props.state) {
            return
        }
        switch (nextProps.state) {
            case STATE.SUCCESS:
                this.success();
                return;
            case STATE.ERROR:
                this.error();
                return;
            case STATE.LOADING:
                this.loading();
                return;
            case STATE.DISABLED:
                this.disable();
                return;
            case STATE.NOTHING:
                this.notLoading();
                return;
            default:
                return
        }
    },

    componentWillUnmount () {
        clearTimeout(this._timeout)
    },

    render () {

        if (this.state.currentState == STATE.LOADING) {
            return (
                <CircularProgress style={{display: 'block', margin: '0 auto'}} />
            );
        }

        return <FlatButton label={this.props.label}
                           disabled={this.state.currentState == STATE.DISABLED}
                           onTouchTap={this.handleClick}
                           style={this.props.style || {}} />
    },

    handleClick (e) {
        if ((this.props.shouldAllowClickOnLoading ||
            this.state.currentState !== 'loading') &&
            this.state.currentState !== 'disabled'
        ) {
            const ret = this.props.onClick(e);
            this.loading(ret)
        } else {
            e.preventDefault()
        }
    },

    loading (promise) {
        this.setState({currentState: 'loading'});
        if (promise && promise.then && promise.catch) {
            promise
                .then(() => {
                    this.success()
                })
                .catch(() => {
                    this.error()
                })
        }
    },

    notLoading () {
        this.setState({currentState: STATE.NOTHING})
    },

    enable () {
        this.setState({currentState: STATE.NOTHING})
    },

    disable () {
        this.setState({currentState: STATE.DISABLED})
    },

    success (callback, dontRemove) {
        this.setState({currentState: STATE.SUCCESS});
        this._timeout = setTimeout(() => {
            callback = callback || this.props.onSuccess;
            if (typeof callback === 'function') {
                callback()
            }
            if (dontRemove === true) {
                return
            }
            this.setState({currentState: STATE.NOTHING})
        }, this.props.durationSuccess)
    },

    error (callback) {
        this.setState({currentState: STATE.ERROR});
        this._timeout = setTimeout(() => {
            callback = callback || this.props.onError;
            if (typeof callback === 'function') {
                callback()
            }
            this.setState({currentState: STATE.NOTHING})
        }, this.props.durationError)
    }
});
