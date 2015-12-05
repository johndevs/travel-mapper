import React from "react";
import ReactDOM from "react-dom";
import {Row,Col,Button,Modal,ModalHeader,ModalBody,ModalFooter,FormInput,FormNote,FormIconField,Card} from 'elemental';
import update from "react-addons-update";
import BurgerMenu from 'react-burger-menu';
import { Router, Route, Link, Navigation } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory';
import Amygdala from 'amygdala';
import {Overlay, Popup} from 'react-overlay-popup';

import CityMap from './citymap/citymap';
import CityLocationList from './locations/locations';
import SearchField from './search/search';

import './app.less';
import './app.css';

class Application extends React.Component{

  constructor(props) {
    super(props);

    // Constants
    this.LOCAL_STORAGE_KEY = 'travel-planner-location-list';

    // Initial state
    this.state = {
      locationList: [],
      warnDelete: false,
      exportOpen: false,
      mapName: this.props.params.planId,
      searching: false
    }

    // Bind methods to this
    this._addLocation = this._addLocation.bind(this);
    this._removeLocation = this._removeLocation.bind(this);
    this._centerLocation = this._centerLocation.bind(this);
    this._saveLocationsInLocalStorage = this._saveLocationsInLocalStorage.bind(this);
    this._loadLocationsFromLocalStorage = this._loadLocationsFromLocalStorage.bind(this);
    this._loadLocationsFromServer = this._loadLocationsFromServer.bind(this);
    this._saveLocationsToServer = this._saveLocationsToServer.bind(this);
    this._removeLocationsFromServer = this._removeLocationsFromServer.bind(this);
    this._locationNameChanged = this._locationNameChanged.bind(this);
    this._saveLocationList = this._saveLocationList.bind(this);
    this._resetLocation = this._resetLocation.bind(this);
    this._toggleWarnDeleteDialog = this._toggleWarnDeleteDialog.bind(this);
    this._toggleExportDialog = this._toggleExportDialog.bind(this);
    this._clearMap = this._clearMap.bind(this);
    this._export = this._export.bind(this);
    this._mapNameChanged = this._mapNameChanged.bind(this);
    this._addSearchResult = this._addSearchResult.bind(this);
    this._getLocationById = this._getLocationById.bind(this);
    this._descriptionChanged = this._descriptionChanged.bind(this);
    this._onLocationsChanged = this._onLocationsChanged.bind(this);

    // Setup REST endpoint
    this.store = new Amygdala({
      'config' : {
        'apiUrl' : 'http://localhost:8081',
        'idAttribute': 'url',
        'localStorage': true
      },
      'schema' : {
        'plans' : {
          'url' : '/plans/'
        }
      }
    });
  }

  componentDidMount() {
    if(this.state.mapName){
      // Load map from server
      this._loadLocationsFromServer(this.state.mapName);
    } else {
      // Load latest map from local storage
      this._loadLocationsFromLocalStorage();
    }
  }

  render() {
    const Menu = BurgerMenu.push;
    return(
      <div>
      <Row className="headerRow">
        <Col>
         <header className="header-text">Travel Planner</header>

         <SearchField onAdd={this._addSearchResult} onCenter={this._centerLocation}/>

         <Menu outerContainerId='app-container' pageWrapId='map-container' right>
            <h1>
              Locations
              <Button title="Center location on current location" size="xs" type="link" onClick={this._resetLocation}>
                <span className="octicon octicon-home" />
              </Button>
              <Button title="Remove all locations from map" size="xs" type="link" style={{color:'red'}} onClick={this._toggleWarnDeleteDialog}>
                <span className="octicon octicon-circle-slash" />
              </Button>
              <Button title="Save to cloud" size="xs" type='link' style={{color:'#34C240'}} onClick={this._toggleExportDialog}>
                <span className="octicon octicon-cloud-upload" />
              </Button>
            </h1>
            <CityLocationList
              onCenter={this._centerLocation}
              onDelete={this._removeLocation}
              onNameChanged={this._locationNameChanged}
              locations={this.state.locationList}
              onChange={this._onLocationsChanged}
            />
         </Menu>
        </Col>
      </Row>
      <Row id="map-container" className="mapRow">
        <Col>
          <CityMap
            onClick={this._addLocation}
            center={this.state.center}
            centerZoom={this.state.centerZoom}
            locations={this.state.locationList}
          />
        </Col>
        </Row>

        <Modal isOpen={this.state.warnDelete} onCancel={this._toggleWarnDeleteDialog} backdropClosesModal>
          <ModalHeader text={"Remove map?"}/>
          <ModalBody>Are you sure you want to remove this map?</ModalBody>
          <ModalFooter>
            <Button type="danger" onClick={this._clearMap} >Remove</Button>
            <Button type="link-cancel" onClick={this._toggleWarnDeleteDialog}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.exportOpen} onCancel={this._toggleExportDialog} backdropClosesModal>
          <ModalHeader text={"Save map to cloud"}/>
          <ModalBody>
            Please enter a name for the map:
            <FormInput ref='mapNameInput' type="text" placeholder="my-visit-to-barcelona" value={this.state.mapName} onChange={this._mapNameChanged}/>
            <FormNote>
              <p>The name will be used as part of the url, for example http://localhost:8080/<b>YourMapName</b>.</p>
              You can always return to this url later to view or modify the map.
            </FormNote>
          </ModalBody>
          <ModalFooter>
            <Button type="success" onClick={this._export}>Save</Button>
            <Button type="link-cancel" onClick={this._toggleExportDialog}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }

  _addLocation(name, lat,long){
    var locationList = this.state.locationList;
    locationList.push({ id: Number(new Date), name: name, location:[lat,long]});
    this._saveLocationList(locationList);
  }

  _removeLocation(location){
    var locationList = this.state.locationList;
    var idx = locationList.indexOf(location);
    locationList.splice(idx, 1);
    this._saveLocationList(locationList);
  }

  _centerLocation(lat,long){
    var newState = update(this.state, {$merge: {
      center: [lat, long],
      centerZoom: 20
    } });
    this.setState(newState);
  }

  _resetLocation(){
    var newState = update(this.state, {$merge: {
      center: NaN,
      centerZoom: NaN
    } });
    this.setState(newState);
  }

  _locationNameChanged(id, newName){
    this._getLocationById(id).name = newName;
    this._saveLocationList(this.state.locationList);
  }

  _descriptionChanged(id, newDescription){
    this._getLocationById(id).description = newDescription;
    this._saveLocationList(this.state.locationList);
  }

  _onLocationsChanged() {
      this._saveLocationList(this.state.locationList);
  }

  _getLocationById(id) {
    var locationList = this.state.locationList;
    for(var i=0; i<locationList.length; i++){
      if(locationList[i].id === id){
        return locationList[i];
      }
    }
  }

  _saveLocationList(locationList) {
    var newState = update(this.state, {$merge: {locationList : locationList} });
    this.setState(newState);
    this._saveLocationsInLocalStorage();
    if(this.state.mapName){
        this._saveLocationsToServer(this.state.mapName);
    }
  }

  _toggleWarnDeleteDialog(event) {
    var newState = update(this.state, {$merge: {warnDelete: !this.state.warnDelete}});
    this.setState(newState);
  }

  _toggleExportDialog(){
    var newState = update(this.state, {$merge: {exportOpen: !this.state.exportOpen}});
    this.setState(newState);
  }

  _clearMap(event) {
    var newState = update(this.state, {$merge: {locationList : []} });
    this.setState(newState);
    this._saveLocationsInLocalStorage();
    this._resetLocation();
    this._toggleWarnDeleteDialog();
    if(this.state.mapName){
        this._removeLocationsFromServer(this.state.mapName);
    }
    this.props.history.pushState(null, '/');
  }

  _isStorageAvailable(type) {
  	try {
  		var storage = window[type], x = '__storage_test__';
  		storage.setItem(x, x);
  		storage.removeItem(x);
  		return true;
  	}
  	catch(e) {
  		return false;
  	}
  }

  _isLocalStorageAvailable() {
    return this._isStorageAvailable('localStorage');
  }

  _saveLocationsInLocalStorage() {
    if(this._isLocalStorageAvailable()){
      window.localStorage[this.LOCAL_STORAGE_KEY] = JSON.stringify(this.state.locationList);
    }
  }

  _loadLocationsFromLocalStorage() {
    if(this._isLocalStorageAvailable() && window.localStorage[this.LOCAL_STORAGE_KEY]){
      var locationList = JSON.parse(window.localStorage[this.LOCAL_STORAGE_KEY]);
      var newState = update(this.state, {$merge: {locationList : locationList} });
      this.setState(newState);
    }
  }

  _loadLocationsFromServer(id) {
    this.store.get('plans', {'url': id}).done(function(result) {
      var locationList = result;
      var newState = update(this.state, {$merge: {locationList : locationList} });
      this.setState(newState);
      this._saveLocationsInLocalStorage();
    }.bind(this));
  }

  _saveLocationsToServer(id) {
    var locationList = this.state.locationList;
    var url = this.store._config.apiUrl + '/plans/' + id;
    this.store.update('plans', {'url': url, locationList: locationList});
  }

  _removeLocationsFromServer(id) {
    var url = this.store._config.apiUrl + '/plans/' + id;
    this.store.remove('plans', {'url': url});
  }

  _mapNameChanged(event) {
    var newState = update(this.state, {$merge: {mapName : event.target.value} });
    this.setState(newState);
  }

  _export() {
    this._saveLocationsToServer(this.state.mapName);
    this.props.history.pushState(null, '/'+this.state.mapName);
    this._toggleExportDialog();
  }

  _addSearchResult(data){
    this._addLocation(data.display_name, data.lat, data.lon);
  }
}

/* Renders the application */
ReactDOM.render((
  <Router history={createBrowserHistory()}>
    <Route path="/" component={Application}>
        <Route path=":planId" component={Application} />
    </Route>
  </Router>
), document.getElementById("app-container"));
