import PreferenceSet from 'App/collections/PreferenceSet';
import GeoSuggest from 'react-geosuggest';


export default class WelcomePage extends React.Component {

    static contextTypes = {
        router: React.PropTypes.object.isRequired
    };

    state = {
        loading: false,
        preferences: PreferenceSet.getCollection().findOne({userId: Meteor.userId()})
    };

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

    /**
     * Updates the user's location preference
     *
     * @param suggest {object} - The geosuggest suggest option.
     * @private
     */
    _updateUserLocation(suggest) {
        // Check is this is a valid place.
        if (!suggest.placeId && suggest.label != this.state.preferences.location) {
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
        this.setState({loading: true});
        Meteor.call("updatePreferences", preferences, function (err, res) {
            that.setState({loading: false});
            that.context.router.replace('/dashboard');
        });
    };


    render() {
        let geosuggest = !this.state.loading ?
            (
                <div className="ui item center">
                    <GeoSuggest country="us"
                                types={['(cities)']}
                                autoActivateFirstSuggest={true}
                                onSuggestSelect={this._updateUserLocation.bind(this)}
                                ref='geosuggest'
                    />
                </div>
            ) : null;

        return (
            <div className="ui container">
                <div className="login-form">
                    <h2 className="ui icon header centered">
                        <i className="circular map icon"/>
                        <div className="content">
                            Select A City
                            <div className="sub header">
                                Howdy! Before we can show you events, we need to know where you'd like to see events
                                for.
                            </div>
                            {geosuggest}
                        </div>
                    </h2>
                </div>
            </div>
        )
    }

}