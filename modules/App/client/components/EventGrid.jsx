/**
 * Created by lusilva on 2/21/16.
 */

import GridEvent from './GridEvent';
import AbsoluteGrid from 'react-absolute-grid';

export default class EventGrid extends React.Component {

    state = {
        events: [],
        preferences: this.props.preferences
    };

    componentDidMount() {
        if (this.state.preferences)
            this._updateEvents(this.state.preferences);
    };

    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        if (nextProps.preferences != this.state.preferences)
            this._updateEvents(nextProps.preferences);
    };

    _updateEvents(preferences){
        console.log('GETTING EVENTS!');
        Meteor.call("getEventsForUser", preferences, function(error, result) {
            console.log(result);
            // loop through each event in result
            _.map(result, function(event, index){
                var filtered = 0;
                if (index > 20 ){
                    filtered = 1;
                }
                console.log(event.id);
                return {key: event._id, event: event, sort: 0, filtered: filtered}

            });

            //check for error first

            // make each item
            this.setState({events: result, preferences: preferences});
        }.bind(this) );
    }

    render() {
        return (
            <div className="ui container">
                <div className="ui grid-events">
                    <AbsoluteGrid items={this.state.events}
                                  displayObject={<GridEvent />}
                                  responsive={true}
                                  itemHeight={463}
                                  itemWidth={290}
                    />
                </div>
            </div>
        )
    }

}