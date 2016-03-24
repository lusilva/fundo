import Alert from 'react-s-alert';
import GeoSuggest from 'react-geosuggest';
import ReactMixin from 'react-mixin';
import _ from 'lodash';
import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';

/**
 * The view for the filters shown in the sidebar on the dashboard.
 *
 * @class
 * @extends React.Component
 */
@ReactMixin.decorate(PureRenderMixin)
export default class Filters extends React.Component {
    static propTypes = {
        filterChangeCallback: React.PropTypes.func.isRequired,
        setLoadingCallback: React.PropTypes.func.isRequired,
        preferences: React.PropTypes.object,
        categories: React.PropTypes.array
    };


    /**
     * The state of the filters.
     *
     * @type {{preferences: ?PreferenceSet, loading: boolean, message: ?string}}
     */
    state = {
        preferences: this.props.preferences,
        loading: !!this.props.preferences,
        message: null
    };

    // The handle for message timeouts so that they can be cleared.
    timeoutHandle = null;


    /** @inheritDoc */
    componentWillReceiveProps(nextProps) {
        // Update the state of the preferences when the props/database changes.
        if (nextProps.preferences != this.state.preferences)
            this.setState({preferences: nextProps.preferences, loading: false});
    };


    /** @inheritDoc */
    componentDidMount() {
        var rootNode = ReactDOM.findDOMNode(this);
        $(rootNode).find('.dropdown')
            .dropdown({
                context: $(rootNode),
                direction: 'downward'
            });
    };


    /** @inheritDoc */
    componentWillUnmount() {
        this._clearMessage();
    };


    /**
     * Gets the message component, shown on top of the filters.
     *
     * @returns {?XML} - The message to display, or null if there is no message.
     * @private
     */
    _getMessage() {
        if (!this.state.message)
            return null;

        return (
            <div className={"ui message " + this.state.message.className}>
                <i className="close icon" onClick={this._clearMessage.bind(this)}/>
                <div className="header">
                    {this.state.message.text}
                </div>
            </div>
        );
    };


    /**
     * Clears a message and hides it.
     *
     * @private
     */
    _clearMessage() {
        if (this.timeoutHandle)
            Meteor.clearInterval(this.timeoutHandle);
        this.timeoutHandle = null;
        this.setState({message: null});
    };


    /**
     * Shows a message to the user.
     *
     * @param isError {boolean} - Whether or not this is an error message
     * @param messageText {string} - The message to display
     * @param opt_duration - The number of milliseconds to display the message for.
     * @private
     */
    _showMessage(isError, messageText, opt_duration) {
        this._clearMessage();
        let className = isError ? 'negative' : 'positive';
        this.setState({message: {text: messageText, className: className}});
        if (opt_duration) {
            this.timeoutHandle =
                Meteor.setTimeout(this._clearMessage.bind(this), opt_duration);
        }
    };


    /** @inheritDoc */
    render() {
        return (
            <div className="ui container">
                {this._getMessage()}
                <div className="ui header item center">Categories</div>
                <div className="ui container">
                    <div className="ui multiple search selection dropdown">
                        <input name="favorite-categories" type="hidden" value=""/>
                        <i className="dropdown icon"/>
                        <div className="default text">Select Categories</div>
                        <div className="menu">
                            {_.map(this.props.categories, function (category) {
                                let key = 'categories-' + category.id;
                                return (
                                    <div key={key} className="item"
                                         data-value={category.name}>
                                        {category.name}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}