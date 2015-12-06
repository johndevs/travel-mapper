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
import React from "react";
import {FormInput,FormIconField,Card,Button,ButtonGroup} from 'elemental';
import {Popup} from 'react-overlay-popup';
import update from "react-addons-update";

class SearchFieldResult extends React.Component {

  constructor(props) {
    super(props);
    this._add = this._add.bind(this);
    this._center = this._center.bind(this);
  }

  render() {
    return (
      <Card>
         <span style={{width:'400px', display:'inline-block'}}>{this.props.data.display_name}</span>
         <ButtonGroup style={{float:'right', display:'inline-block'}}>
           <Button size="xs" type="success" onClick={this._center}>
             <span className="octicon octicon-eye" />
           </Button>
           <Button size="xs" type="primary" onClick={this._add}>
             <span className="octicon octicon-file-add" />
           </Button>
         </ButtonGroup>
      </Card>
    )
  }

  _add(event){
    this.props.onAdd(this.props.data);
  }

  _center(event){
    this.props.onCenter(this.props.data);
  }
}

export default class SearchField extends React.Component {

  constructor(props) {
    super(props);

    this.GEO_SEARCH_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

    this.state = {
      searching: false,
      results: [],
      query: ''
    }

    this._handleSearch = this._handleSearch.bind(this);
    this._search = this._search.bind(this);
    this._onAdd = this._onAdd.bind(this);
    this._onCenter = this._onCenter.bind(this);
    this._clear = this._clear.bind(this);
  }

  render() {
    var results = this.state.results;
    var self = this;
    return (
      <div className="search-field">
        <FormIconField  iconPosition="right" iconKey="search" iconColor="default" iconIsLoading={this.state.searching}>
          <FormInput onChange={this._handleSearch} type="search" placeholder="Search..." name="icon-form-search" value={this.state.query}/>
        </FormIconField>
        { results.length > 0 ?
          <Popup strategy='bottom right'>
              <Card className="search-field-popup">
                 { results.map(function(result){
                     return <SearchFieldResult
                                key={result.place_id}
                                data={result}
                                onAdd={self._onAdd}
                                onCenter={self._onCenter}
                     />
                 })}
              </Card>
          </Popup>
        : null }
      </div>
    )
  }

  _handleSearch(event){
    var self = this;
    var searchString = event.target.value;

    if(!searchString){
      this._clear();
      return;
    }

    clearTimeout(this.searchDelayTimer);

    var newState = update(self.state, {$merge:{query: searchString, searching: true}});
    self.setState(newState);

    this.searchDelayTimer = setTimeout(function(){
      self._search(searchString, function(json){
        var newState = update(self.state, {$merge:{results: json, searching:false}});
        self.setState(newState);
      });
    }, 1000);
  }

  _search(address, callback){
    var addressEncoded = encodeURIComponent(address);
    fetch(this.GEO_SEARCH_URL+addressEncoded).then(function(response) {
      return response.json();
    }).then(callback);
  }

  _onAdd(data) {
    if(this.props.onAdd){
        this.props.onAdd(data);
        this._clear();
    }
  }

  _onCenter(data) {
    if(this.props.onCenter){
        this.props.onCenter(data.lat, data.lon);
    }
  }

  _clear() {
    var newState = update(this.state, {$merge:{query: '', results: [], searching:false}});
    this.setState(newState);
  }
}
