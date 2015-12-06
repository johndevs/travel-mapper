/**
 *  Copyright 2015 John Ahlroos
 *
 *	This file is part of Travel Mapper.
 *
 *  Travel Mapper is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Travel Mapper is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Travel Mapper.  If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';
import ReactDOM from "react-dom"
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import update from "react-addons-update";

/**
 * Represents a map of the current location
 */
export default class CityMap extends React.Component {

  /**
   * Creates a new city map
   * @param  {array} props properties
   */
  constructor(props) {
    super(props);

    this.REVERSE_GEO_SEARCH_URL = 'https://nominatim.openstreetmap.org/reverse?format=json&';

    this.state = {
      center: props.center,
      centerZoom: this._getCenterZoom(props),
      locations: this.props.locations
    };


    this._handleCurrentPosition = this._handleCurrentPosition.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
    this._getCenterZoom = this._getCenterZoom.bind(this);
    this._search = this._search.bind(this);
  }

  /**
   * Triggered when component is mounted
   */
  componentDidMount() {
    if(!this.state.center){
      navigator.geolocation.getCurrentPosition(this._handleCurrentPosition);
    }
  }

  /**
   * Triggered when props change
   * @param  {[type]} nextProps [description]
   * @return {[type]}           [description]
   */
  componentWillReceiveProps(nextProps){
    var newState = update(this.state, {$merge: {
      center: nextProps.center,
      centerZoom: this._getCenterZoom(nextProps),
      locations: nextProps.locations
    }});
    this.setState(newState);

    if(!nextProps.center){
      navigator.geolocation.getCurrentPosition(this._handleCurrentPosition);
    }
  }

  _getCenterZoom(props) {
    return props.centerZoom ? props.centerZoom : 13
  }

  /**
   * Event handler for handling coordinates provided by {navigator.geolocation}.
   *
   * @param  {[object} position Object with latitude and longitude properties
   */
  _handleCurrentPosition(position){
    var coords = position.coords;
    var newState = update(this.state, {$merge: {center: [coords.latitude,
      coords.longitude]}});
    this.setState(newState);
  }

  /**
   * Handles user clicking or tapping on Map
   * @param  {[]} event [description]
   * @return {[type]}       [description]
   */
  _handleOnClick(event) {
    var location = event.latlng;
    var lat = location.lat;
    var long = location.lng;
    var self = this;
    this._search(lat, long, function(data){
      self.props.onClick(data.display_name, data.lat, data.lon);
    });
  }

  _search(lat, lon, callback){
    fetch(this.REVERSE_GEO_SEARCH_URL+"lat="+lat+"&lon="+lon).then(function(response) {
      return response.json();
    }).then(callback);
  }

  /**
   * Renders the component into the dom using JSX
   *
   * @return {[JSX object]} The HTML to render into the DOM
   */
  render() {
    return (
        <Map className="city-map"
          center={this.state.center}
          zoom={this.state.centerZoom}
          onLeafletClick={this._handleOnClick}>
          <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png' />
          {this.state.locations.map(function(location){
            var lat = Number(location.location[0]);
            var lon = Number(location.location[1]);
            //var icon = L.divIcon({className: 'octicon octicon-pin'});
            return (
              <Marker key={location.id} position={[lat,lon]} >
                <Popup>
                  <span>{location.name}</span>
                </Popup>
              </Marker>
            )
          })}
        </Map>
    );
  }
}
