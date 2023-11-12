var tj = require('togeojson');
var DOMParser = require('xmldom').DOMParser;
var WKT =  require('wkt'); //require('ol/format/WKT');
var DxfParser = require('dxf-parser');
var Shp = require('shp');
//var GeoPackage = require('geopackage')
var C = {};

C.featuresToGeoJSON = function(features){
  var reader = new GeoJSON();
  var geojson = reader.writeFeatures(features);
  return JSON.parse(geojson);
}

C.toGeoJSON = function(data,opt){
  var reader = false;
  console.log(opt.type);
  switch(opt.type){
    case 'geojson':{
      if(typeof data == "string"){
        return JSON.parse(data);
      }else{
        return data;
      }
      break;
    }
    case 'gpx':{
      return this.gpx2GeoJSON(data);
      break;
    }
    case 'kml':{
      return this.kml2GeoJSON(data);
      break;
    }
    case 'wkt':{
      reader = new WKT();
      break;
    }
    case 'dxf':{
      //return this.dxf2GeoJSON(data);
      break;
    }
    case 'shp':{
      return this.shp2GeoJSON(data);
      break;
    }
    case 'gpkg':{
      return this.gpkg2GeoJSON(data);
      break;
    }
  }
}

C.wkt2GeoJSON = function(wkt){
  //https://www.npmjs.com/package/wkt
  var wktarr = wkt.parse(wkt);
  console.log(wktarr);
  return {type:""};
}


C.gpx2GeoJSON = function(data){
  //https://www.npmjs.com/package/togeojson
  var gpx = new DOMParser().parseFromString(data);
  return tj.gpx(gpx);
}

C.kml2GeoJSON = function(data){
  //https://www.npmjs.com/package/togeojson
  var kml = new DOMParser().parseFromString(data);
  return tj.kml(kml);
}

C.dxf2GeoJSON = function(dxf){
  //https://www.npmjs.com/package/dxf-parser
  var parser = new DxfParser();
  var dxfResult = parser.parseSync(dxf);
  return this.dxfToGeoJSON(dxfResult);
}

C.shp2GeoJSON = function(data){
  //https://www.npmjs.com/package/shp
  if(data.indexOf('.shp')!==-1){
    data = data.replace('.shp','');
  }
  return Shp.readFileSync(data);
}

C.gpkg2GeoJSON = function(data){
  //https://www.npmjs.com/package/geopackage
  //const gpkg = new GeoPackage(data)
  return gpkg;
}


C.dxfToGeoJSON = function (dxf) {
  debugger;
  var features = [];
  dxf.entities.map(function (e) {
    var type = e.type;

    if (['INSERT', 'POINT'].indexOf(type) !== -1) {
      features.push({
        "type": "Feature",
        "properties": {
          "layer": e.layer
        },
        "geometry": {
          "type": "Point",
          "coordinates": [e.position.x, e.position.y]
        }
      });
    } else if (['POLYLINE', 'LINE', 'LWPOLYLINE'].indexOf(type) !== -1) {
      var coords = [];
      e.vertices.map(function (v) {
        coords.push([v.x, v.y]);
      });

      if (e.shape == true) {
        coords.push(coords[0]);
        features.push({
          "type": "Feature",
          "properties": {
            "layer": e.layer
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [coords]
          }
        });
      } else {
        features.push({
          "type": "Feature",
          "properties": {
            "layer": e.layer
          },
          "geometry": {
            "type": "LineString",
            "coordinates": coords
          }
        });
      }
    } else if (['3DFACE', 'SOLID', 'TRACE'].indexOf(type) !== -1) {
      var coords = [];
      e.vertices.map(function (v) {
        coords.push([v.x, v.y]);
      });
      features.push({
        "type": "Feature",
        "properties": {
          "layer": e.layer
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [coords]
        }
      });
    }
  });
  return { "type": "FeatureCollection", "features": features };
};

module.exports = C;

