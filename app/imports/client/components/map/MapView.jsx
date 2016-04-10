import { GoogleMap, Marker, InfoWindow } from "react-google-maps";
import { default as MarkerClusterer } from "react-google-maps/lib/addons/MarkerClusterer";
import _ from 'lodash';

import MapEvent from '../events/MapEvent';

export default class MapView extends React.Component {
  static propTypes = {
    events: React.PropTypes.array.isRequired
  };

  state = {
    activeMarker: null
  };


  _getMapStyles() {
    return [
      {
        "featureType": "road",
        "stylers": [
          {
            "hue": "#5e00ff"
          },
          {
            "saturation": -79
          }
        ]
      },
      {
        "featureType": "poi",
        "stylers": [
          {
            "saturation": -78
          },
          {
            "hue": "#6600ff"
          },
          {
            "lightness": -47
          },
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.local",
        "stylers": [
          {
            "lightness": 22
          }
        ]
      },
      {
        "featureType": "landscape",
        "stylers": [
          {
            "hue": "#5c6bc0"
          },
          {
            "saturation": -11
          }
        ]
      },
      {},
      {},
      {
        "featureType": "water",
        "stylers": [
          {
            "saturation": -65
          },
          {
            "hue": "#1900ff"
          },
          {
            "lightness": 8
          }
        ]
      },
      {
        "featureType": "road.local",
        "stylers": [
          {
            "weight": 1.3
          },
          {
            "lightness": 30
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "simplified"
          },
          {
            "hue": "#5e00ff"
          },
          {
            "saturation": -16
          }
        ]
      },
      {
        "featureType": "transit.line",
        "stylers": [
          {
            "saturation": -72
          }
        ]
      },
      {}
    ];

  };

  _handleMarkerClick(marker) {
    if (this.state.activeMarker != marker.id)
      this.setState({activeMarker: marker.id});
    else
      this.setState({activeMarker: null});
  };

  _renderInfoWindow(ref, marker) {
    return (
      //You can nest components inside of InfoWindow!
      <InfoWindow
        key={`${ref}_info_window`}
        onCloseClick={this._handleMarkerClick.bind(this, marker)}
      >
        <MapEvent event={marker}/>
      </InfoWindow>
    );
  }

  render() {
    let events = this.props.events;

    events = _.omitBy(_.map(events, function(event) {
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
        options={{scrollwheel: false, styles: this._getMapStyles()}}
      >
        <MarkerClusterer
          averageCenter
          enableRetinaIcons
          gridSize={ 30 }
        >
          {_.map(events, function(marker) {

            let eventImage = require("../../img/fundo-default-event-img.png");
            // First check if event has a medium image, if not then check if it has a large image.
            if (marker.image && marker.image.thumb && marker.image.thumb.url) {
              eventImage = marker.image.thumb.url;
            } else if (marker.image && marker.image.small && marker.image.small.url) {
              eventImage = marker.image.small.url;
            } else {
              _.each(_.keys(marker.image), function(imageType) {
                if (marker.image[imageType].url) {
                  eventImage = marker.image[imageType].url;
                }
              });
            }

            marker.showInfo = marker.id == this.state.activeMarker;
            const ref = `marker_${marker.id}`;

            return (
              <Marker position={marker.position}
                      ref={ref}
                      icon={{
                                        url: eventImage,
                                        scaledSize: new google.maps.Size(32, 32)
                                    }}
                      key={marker.id}
                      onClick={this._handleMarkerClick.bind(this, marker)}
              >
                {marker.showInfo ? this._renderInfoWindow(ref, marker) : null}
              </Marker>
            )
          }.bind(this))}
        </MarkerClusterer>
      </GoogleMap>
    );
  }
}