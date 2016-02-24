import Alert from 'react-s-alert';
import GeoSuggest from 'react-geosuggest';


export default class Filters extends React.Component {

    state = {
        preferences: this.props.preferences,
        loading: !!this.props.preferences,
        message: null
    };

    timeoutHandle = null;

    componentWillReceiveProps(nextProps) {
        if (nextProps.preferences != this.state.preferences)
            this.setState({preferences: nextProps.preferences, loading: false});
    };

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

    _clearMessage() {
        if (this.timeoutHandle)
            Meteor.clearInterval(this.timeoutHandle);
        this.timeoutHandle = null;
        this.setState({message: null});
    }

    _showMessage(isError, message, duration) {
        this._clearMessage();
        let className = isError ? 'negative' : 'positive';
        this.setState({message: {text: message, className: className}});
        if (duration) {
            this.timeoutHandle = Meteor.setTimeout(function () {
                this.setState({message: null});
            }.bind(this), duration);
        }

    };

    _updateUserLocation(suggest) {
        if (!suggest.placeId && suggest.label != this.state.preferences.location) {
            this._showMessage(true, suggest.label + ' is not a valid location!');
            this.refs.geosuggest.update(this.state.preferences.location || '');
            return;
        }
        let preferences = this.state.preferences;
        if (preferences && preferences.location == suggest.label)
            return;
        this.setState({loading: true});
        preferences.location = suggest.label;
        Meteor.call("updatePreferences", preferences, function (err, res) {
            this.setState({loading: false});
            if (!err) {
                this._showMessage(false, 'Location updated to ' + suggest.label, 5000);
            } else {
                Alert.error('Error occurred while updating location');
            }
        }.bind(this));
    };

    _skipSuggestFunc(suggest) {
        return this.state.preferences && this.state.preferences.location == suggest.description;
    };

    render() {
        let initialLocation = (this.state.preferences && this.state.preferences.location) ?
            this.state.preferences.location : null;

        let filters =
            (typeof window != 'undefined') && window.google && window.google.maps && !this.state.loading ?
                (
                    <div className="ui container">
                        {this._getMessage()}
                        <div className="ui header item center">Select Location</div>
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
                        <div className="ui header item center">Select Price</div>
                    </div>
                ) :
                (
                    <div className="ui active dimmer">
                        <div className="ui text loader">Loading</div>
                    </div>
                );
        return filters;
    }
}