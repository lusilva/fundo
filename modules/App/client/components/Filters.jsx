import Alert from 'react-s-alert';
import GeoSuggest from 'react-geosuggest';

/**
 * The view for the filters shown in the sidebar on the dashboard.
 */
export default class Filters extends React.Component {
    static propTypes = {
        filterChangeCallback: React.PropTypes.func.isRequired,
        setLoadingCallback: React.PropTypes.func.isRequired,
        preferences: React.PropTypes.object,
        categories: React.PropTypes.array
    };


    /**
     * The state of the filters.
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


    /**
     * Stop displaying the loading message.
     *
     * @private
     */
    _filterChangeCallback(newPreferences) {
        this.props.filterChangeCallback(newPreferences);
    };


    _setLoading(isLoading) {
        this.props.setLoadingCallback(isLoading);
    };


    /**
     * Updates the user's location preference
     *
     * @param suggest {object} - The geosuggest suggest option.
     * @private
     */
    _updateUserLocation(suggest) {
        // Check is this is a valid place.
        if (!suggest.placeId && suggest.label != this.state.preferences.location) {
            this._showMessage(true, (suggest.label + ' is not a valid location!'));
            this.refs.geosuggest.update(this.state.preferences.location || '');
            return;
        }
        // Get the user's preferences, and make sure this place is different then the user's current location.
        let preferences = this.state.preferences;
        if (preferences && preferences.location == suggest.label)
            return;

        // Show the loading spinner while preferences are updated on the server.
        preferences.location = suggest.label;
        let that = this;
        this._filterChangeCallback();
        this._setLoading(true);
        Meteor.call("updatePreferences", preferences, function (err, res) {
            if (!err) {
                let message = 'Location updated to ' + suggest.label;
                that._showMessage(false, message, 5000);
            } else {
                Alert.error('Error occurred while updating location');
            }
            this._setLoading(false);
        }.bind(this));
    };


    /**
     * Skips suggestions and don't show them to the user.
     *
     * @param suggest {object} - The geosuggest suggest object.
     * @returns {boolean} - Whether or not to show this suggestion.
     * @private
     */
    _skipSuggestFunc(suggest) {
        return !!this.state.preferences && this.state.preferences.location == suggest.description;
    };


    /** @inheritDoc */
    render() {
        let initialLocation = (this.state.preferences && this.state.preferences.location) ?
            this.state.preferences.location : null;

        let geosuggest = (typeof window != 'undefined') && window.google && window.google.maps && !this.state.loading ?
            (
                <div className="ui item center">
                    <GeoSuggest country="us"
                                types={['(cities)']}
                                initialValue={initialLocation || ''}
                                autoActivateFirstSuggest={true}
                                onSuggestSelect={this._updateUserLocation.bind(this)}
                                skipSuggest={this._skipSuggestFunc.bind(this)}
                                ref='geosuggest'
                    />
                </div>
            ) : null;


        return (
            <div className="ui container">
                {this._getMessage()}
                <div className="ui header item center">Select Location</div>
                {geosuggest}
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
                                         data-value={category.category_id}>
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