/*
 * Base Google Map example
 */
import shouldPureComponentUpdate from 'react-pure-render/function';

import GoogleMap from 'google-map-react';
import MyGreatPlace from './my_great_place.jsx';

export default class SimpleMapPage extends React.Component {
    static propTypes = {
        center: React.PropTypes.array,
        zoom: React.PropTypes.number,
        greatPlaceCoords: React.PropTypes.any,
        events: React.PropTypes.array.isRequired
    };

    shouldComponentUpdate = shouldPureComponentUpdate;

    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.events.length == 0)
            return null;

        let position = this.props.events[0].position;
        let lat = parseFloat(position.lat);
        let lng = parseFloat(position.lng);

        return (
            <div>
                <div className="ui segment left floated map-list">
                    Hey
                </div>

                <div className="ui segment right floated map-container">
                    <GoogleMap
                        style={{width:'100%', height:'100%'}}
                        // apiKey={YOUR_GOOGLE_MAP_API_KEY} // set if you need stats etc ...
                        center={[lat, lng]}
                        zoom={this.props.zoom}>
                        {_.map(this.props.events, function (event) {
                            if (!event.position || !event.position.lat || !event.position.lng) {
                                return null;
                            }
                            let lat = parseFloat(event.position.lat);
                            let lng = parseFloat(event.position.lng);
                            return <MyGreatPlace key={event.id} lat={lat} lng={lng} text={'A'} /* Kreyser Avrora */ />
                        })}
                    </GoogleMap>
                </div>
            </div>
        );
    }
}