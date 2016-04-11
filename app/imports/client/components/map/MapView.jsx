import { GoogleMap, Marker, InfoWindow } from "react-google-maps";
import { default as MarkerClusterer } from "react-google-maps/lib/addons/MarkerClusterer";
import _ from 'lodash';
import ReactList from 'react-list';

import MapEvent from '../events/MapEvent';

export default class MapView extends React.Component {
  static propTypes = {
    events: React.PropTypes.array.isRequired
  };

  state = {
    activeMarker: null,
    activeCluster: null,
    clusteredEvents: []
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
      this.setState({activeMarker: marker.id, activeCluster: null});
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
  };

  _closeClusterInfo() {
    this.setState({activeCluster: null, clusteredEvents: []});
  };


  _renderItem(index, key) {
    return (
      <div key={key}>
        <MapEvent event={this.state.clusteredEvents[index]}/>
        {index < this.state.clusteredEvents.length - 1 ? <br/> : null}
      </div>
    );
  };

  _handleClusterClick(cluster) {
    this.setState({activeCluster: null, clusteredEvents: []});

    if (cluster.getMarkers().length == 0) {
      return;
    }
    let firstPosition = cluster.getMarkers()[0].position;
    let position = [firstPosition.lat(), firstPosition.lng()];
    // If all markers are not at the same position, then return.
    for (var i = 1; i < cluster.getMarkers().length; ++i) {
      let thisPosition = cluster.getMarkers()[i].position;
      if (thisPosition.lat() !== position[0] || thisPosition.lng() !== position[1]) {
        this.setState({activeCluster: null, clusteredEvents: []});
        return;
      }
    }

    let clusteredEvents = [];
    _.each(this.props.events, function(event) {
      if (Math.abs(event.position.lat - position[0]) < 0.0001 && Math.abs(event.position.lng - position[1]) < 0.0001) {
        clusteredEvents.push(event);
      }
    });
    this.setState({activeCluster: position, clusteredEvents});
  };


  _displayOverview() {
    if (!this.state.activeCluster)
      return;

    let lat = this.state.activeCluster[0];
    let lng = this.state.activeCluster[1];

    return (
      <InfoWindow position={{lat, lng}}
                  onCloseClick={this._closeClusterInfo.bind(this)}>
        <div style={{maxHeight: '200px'}}>
          <ReactList
            itemRenderer={this._renderItem.bind(this)}
            length={this.state.clusteredEvents.length}
          />
        </div>
      </InfoWindow>
    )
  };


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
          onClick={this._handleClusterClick.bind(this)}
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

        {this.state.activeCluster ? this._displayOverview() : null }

      </GoogleMap>
    );
  }
}