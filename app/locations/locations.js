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
import {Form,InputGroup,FormInput,Button,ButtonGroup,Modal,ModalHeader,ModalBody,ModalFooter,Pagination, Card} from 'elemental';
import update from "react-addons-update";

/**
 * Represents details for the location.
 */
class CityLocationDetails extends React.Component {

  /**
   * Creates a new details component for a location
   *
   * @param  {[Object]} props Properties passed to the element
   */
  constructor(props){
    super(props);
  }

  /**
   * Renders the component to DOM
   */
  render() {
    if(this.props.visible){
      var lat = this.props.location.location[0];
      var lon = this.props.location.location[1];
      return (
        <Card>
          <InputGroup>Coordinates:&nbsp;
            <InputGroup.Section>
              <FormInput size="xs" type="text" placeholder="Latitude" value={lat} />
            </InputGroup.Section>
            <InputGroup.Section>
              <FormInput size="xs" type="text" placeholder="Longitude" value={lon} />
            </InputGroup.Section>
          </InputGroup>
          <FormInput placeholder="Location details..." multiline />
        </Card>
      );
    }
    return null;
  }
}

/**
 * Represents a location provided by the user
 */
class CityLocation extends React.Component {

  /**
   * Creates a new city location
   *
   * @param  {[type]} props [description]
   * @return {[type]}       [description]
   */
  constructor(props){
    super(props);
    this.state = {
      name: this.props.location.name,
      warnDelete: false,
      detailsVisible: false
    };
    this._center = this._center.bind(this);
    this._delete = this._delete.bind(this);
    this._nameChanged = this._nameChanged.bind(this);
    this._fireChangeEvent = this._fireChangeEvent.bind(this);
    this._toggleWarnDeleteDialog = this._toggleWarnDeleteDialog.bind(this);
    this._toggleDetailsVisible = this._toggleDetailsVisible.bind(this);
  }

  /**
   * Centers on a coordinate
   *
   * @param  {[ClickEvent]} event The click event
   */
  _center(event) {
      var location = this.props.location.location;
      var lat = location[0];
      var lng = location[1];
      this.props.onCenter(lat, lng);
  }

  /**
   * Removes a location
   *
   * @param  {[ClickEvent]} event The click event
   */
  _delete(event) {
    this.props.onDelete(this.props.location.location);
    this._toggleWarnDeleteDialog(event);
  }

  /**
   * Toggles the visibility of the location removal warning dialog
   *
   * @param  {[ClickEvent]} event The click event
   */
  _toggleWarnDeleteDialog(event) {
    var newState = update(this.state, {$merge: {warnDelete: !this.state.warnDelete}});
    this.setState(newState);
  }

  /**
   * Triggered when the name field was changed
   *
   * @param  {[ChangeEvent]} event The change event
   */
  _nameChanged(event) {
    var newState = update(this.state, {$merge: {name: event.target.value}});
    this.setState(newState);
  }

  /**
   * Notifies the onNameChanged listener of a change
   *
   * @param  {[BlurEvent]} event The blur event
   */
  _fireChangeEvent(event){
    if(this.props.name !== this.state.name && this.props.onNameChanged){
      this.props.onNameChanged(this.props.id, this.state.name);
    }
  }

  /**
   * Toggles the visibility of the details of a location
   *
   * @param  {[ClickEvent]} event The click event
   */
  _toggleDetailsVisible(event){
    var newState = update(this.state, {$merge: {detailsVisible: !this.state.detailsVisible}});
    this.setState(newState);
  }

  /**
   * Renders the component into the dom using JSX
   *
   * @return {[JSX object]} The HTML to render into the DOM
   */
  render() {
    return (
      <div>
        <InputGroup contiguous>
          <InputGroup.Section grow>
            <FormInput className="location-list-location" size="xs" type="text" placeholder="Location name" value={this.state.name} onChange={this._nameChanged} onBlur={this._fireChangeEvent}/>
          </InputGroup.Section>
          <InputGroup.Section>
            <ButtonGroup>
              <Button size="xs" type="success" onClick={this._toggleDetailsVisible}><span className="octicon octicon-info" /></Button>
              <Button size="xs" type="primary" onClick={this._center}><span className="octicon octicon-eye" /></Button>
              <Button size="xs" type="danger" onClick={this._toggleWarnDeleteDialog}><span className="octicon octicon-flame" /></Button>
            </ButtonGroup>
            <Modal isOpen={this.state.warnDelete} onCancel={this._toggleWarnDeleteDialog} backdropClosesModal>
            	<ModalHeader text={"Remove "+this.state.name+"?"}/>
            	<ModalBody>Are you sure you want to remove "{this.state.name}" from the map?</ModalBody>
            	<ModalFooter>
            		<Button type="danger" onClick={this._delete}>Remove</Button>
            		<Button type="link-cancel" onClick={this._toggleWarnDeleteDialog}>Cancel</Button>
            	</ModalFooter>
            </Modal>
          </InputGroup.Section>
        </InputGroup>
        <CityLocationDetails visible={this.state.detailsVisible} location={this.props.location} />
      </div>
    );
  }
}

/**
 * Represents a list of locations provided by the user
 */
export default class CityLocationList extends React.Component {

    /**
     * Creates a new  location
     *
     * @param  {[Object]} props The properties passed to the element
     */
    constructor(props){
      super(props);

      this.state = {
        currentPage: 1,
        locationsPerPage: 10
      }

      this._center = this._center.bind(this);
      this._delete = this._delete.bind(this);
      this._nameChanged = this._nameChanged.bind(this);
      this._pageChanged = this._pageChanged.bind(this);
    }

    /**
     * Centers on a latitude and longitude
     *
     * @param  {[Number]} latitude The latitude of the location
     * @param  {[Number]} longitude The longitude of the location
     */
    _center(latitude, longitude) {
      if(this.props.onCenter){
        this.props.onCenter(latitude, longitude);
      }
    }

    /**
     * Triggered when location is deleted
     *
     * @param  {[Object]} location The location to remove
     */
    _delete(location) {
      if(this.props.onDelete) {
        this.props.onDelete(location);
      }
    }

    _nameChanged(id, newName) {
      if(this.props.onNameChanged){
          this.props.onNameChanged(id, newName);
      }
    }

    _pageChanged(page) {
      var newState = update(this.state, {$merge:{currentPage: page}});
      this.setState(newState);
    }

  /**
   * Renders the component into the dom using JSX
   *
   * @return {[JSX object]} The HTML to render into the DOM
   */
  render () {
    var self = this;
    var locations = this.props.locations.slice(
        (this.state.currentPage-1) * this.state.locationsPerPage,
        this.state.currentPage * this.state.locationsPerPage
    );
    return (
      <div>
        <Pagination
          currentPage={this.state.currentPage}
          onPageSelect={this._pageChanged}
          pageSize={this.state.locationsPerPage}
          plural='locations'
          singular='location'
          total={this.props.locations.length}
          limit={this.state.locationsPerPage}
        />
        <Form type="inline">
          { locations.map(function(location){
              return <CityLocation
                onCenter={self._center}
                onDelete={self._delete}
                onNameChanged={self._nameChanged}
                id={location.id}
                key={location.id}
                location={location} />;
          })}
        </Form>
      </div>
    );
  }
}
