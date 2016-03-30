import { GoogleMap, Marker } from "react-google-maps";
import { default as MarkerClusterer } from "react-google-maps/lib/addons/MarkerClusterer";
import _ from 'lodash';

export default class MapView extends React.Component {
    static propTypes = {
        events: React.PropTypes.array.isRequired
    };

    render() {
        let events = this.props.events;

        events = _.omitBy(_.map(events, function (event) {
            if (event.position && event.position.lat && event.position.lng) {
                event.position = {
                    lat: parseFloat(event.position.lat),
                    lng: parseFloat(event.position.lng)
                };
                return event;
            }
            return null;
        }), _.isNull);

        return (
            <GoogleMap
                containerProps={{
          ...this.props,
          style: {
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: '0',
            left: '0',
            margin: '0'
          }
        }}
                defaultZoom={ 11 }
                defaultCenter={events[0].position}
                options={{scrollwheel: false}}
            >
                <MarkerClusterer
                    averageCenter
                    enableRetinaIcons
                    gridSize={ 60 }
                >
                    {_.map(events, function (marker) {
                        return <Marker position={marker.position}
                                       key={ marker.id}/>
                    })}
                </MarkerClusterer>
            </GoogleMap>
        );
    }
}