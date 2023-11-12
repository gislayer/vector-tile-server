const converter = require('./API-converter');
const geojsonvt = require('geojson-vt');
const fs = require('fs');
const moment = require('moment');
const bbox = require('@turf/bbox');
const { app } = require('../GL-electron');

function getGeoJSON(data) {
  var status = false;
  var options = {
    encoding: 'utf8',
    flag: 'r'
  };
  if (["shp"].indexOf(data.extension) !== -1) {
    try {
      var geojson = converter.toGeoJSON(data.path, {
        type: data.extension,
        epsg: 'EPSG:4326'
      });
      status = true;
    } catch (err) {
      status = false;
    }
  } else {
    try {
      const datam = fs.readFileSync(data.path, options);
      var geojson = converter.toGeoJSON(datam, {
        type: data.extension,
        epsg: 'EPSG:4326'
      });
      status = true;
    } catch (err) {
      status = false;
    }
  }
  return {
    status: status,
    geojson: geojson
  }
}


const timeFormats = [
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "YYYY/MM/DD",
  "DD/MM/YYYY",
  "YYYY.MM.DD",
  "DD.MM.YYYY",
  "YYYY.MM.DD HH:MM",
  "YYYY-MM-DD HH:MM",
  "YYYY/MM/DD HH:MM",
  "DD-MM-YYYY HH:MM",
  "DD/MM/YYYY HH:MM",
  "DD.MM.YYYY HH:MM",
  "YYYY-MM-DDTHH:MM:SS",
  "YYYY-MM-DDTHH:MM:SSZ",
  "YYYY-MM-DDTHH:MM:SS.SSSZ"
];


function findBigSameVal(counts) {
  var max = 0;
  var base = '';

  for (var type in counts) {
    var num = counts[type];

    if (num >= max) {
      max = num;
      base = type;
    }
  }

  return base;
}

function findTimeFormat(timetext) {
  var ind = -1;
  var start = 0;
  if (timetext.indexOf(':') !== -1) {
    start = 6;
  }
  for (var i = start; i < timeFormats.length; i++) {
    var timeformat = timeFormats[i];
    if (moment(timetext, timeformat, true).isValid()) {
      ind = i;
      break;
    }
  }

  return timeFormats[ind];
}

function getValueType(value) {
  var type = 'string';

  var res = typeof value;

  switch (res) {
    case 'string':
      var getformat = findTimeFormat(value);
      if(getformat!==undefined){
        var isDateControlValue = moment(value, getformat);
        if (isDateControlValue.isValid()) {
          type = 'date';
        } else {
          type = 'string';
        }
      }else{
        type='string';
      }
      

      

      break;

    case 'number':
      var a = parseFloat(value);
      var b = parseInt(value, 10);
      var fark = a - b;

      if (fark == 0) {
        type = 'number';
      } else if (fark > 0 && fark < 1) {
        type = 'double';
      } else {
        type = 'number';
      }

      break;

    case 'boolean':
      type = 'boolean';
      break;
  }

  return type;
}

function countArray(array_elements) {
  var counts = {};
  array_elements.forEach(function (x) {
    counts[x] = (counts[x] || 0) + 1;
  });
  return counts;
}


function findFields(geojson) {
  var features = geojson.features;
  var sutunlar = [];
  var sutunjson = {};
  var control = 0;
  var max = 10;

  if (features.length < 10) {
    max = features.length;
  }

  for (var i = 0; i < max; i++) {
    var props = features[i].properties;

    for (var j in props) {
      if (typeof props[j] !== 'undefined' && typeof props[j] !== "object" && typeof props[j] !== "function" && props[j] !== null) {
        var type = getValueType(props[j]);
        var column = j;
        if (typeof sutunjson[column] == 'undefined') {
          sutunjson[column] = [type];
        } else {
          sutunjson[column].push(type);
        }
      }
    }
  }

  for (var i in sutunjson) {
    //var column = i.toLowerCase();
    var column = i;
    var dizi = sutunjson[column];
    var array_elements = countArray(dizi);
    var resultType = findBigSameVal(array_elements);
    if (resultType == 'date') {
      debugger;
      var inddate = dizi.indexOf('date');
      var props = features[inddate].properties;
      var timeformat = findTimeFormat(props[column]);
      var knt = moment(props[column], timeformat);
      if (knt.isValid()) {
        sutunlar.push({
          value: column,
          text: column,
          type: resultType,
          format: timeformat
        });
      } else {
        sutunlar.push({
          value: column,
          text: column,
          type: resultType,
          format: 'YYYY-MM-DD'
        });
      }

    } else {
      sutunlar.push({
        value: column,
        text: column,
        type: resultType
      });
    }

  }

  return sutunlar;
}

module.exports = {
  getBboxFields(req, res) {
    console.log("getBboxFields İsteği Geldi");
    var data = req.body;
    var geojsont = getGeoJSON(data);
    try {
      var fields = findFields(geojsont.geojson);
      var bounds = bbox.default(geojsont.geojson);
      res.send({
        status: true,
        result: {
          fields: fields,
          bbox: bounds
        }
      });
    } catch (e) {
      res.send({
        status: false,
        result: []
      });
    }
  },
  getAllStyle(req, res) {
    req.app.locals.sql.getAllStyles(function (result) {
      if (result.status) {
        req.app.locals.styles = result.result;
        res.send({
          status: true,
          result: result.result
        });
      } else {
        res.send({
          status: false,
          result: []
        });
      }
    })
  },

  stop(req, res) {
    console.log("Geojson Hazırlama İsteği Geldi");
    var data = req.body;
    req.app.locals.sql.getActiveService(data.file_id, function (result) {
      var deletion = true;
      if (result.status == true && data.type !== "wfs") {
        var have = [];
        result.result.map(function (a) {
          have.push(a.type);
        });
        var cntrolnum = 0;
        var controlArr = ["wms", "wmts", "xyz", "pbf", "mvt"];
        controlArr.map(function (b) {
          if (have.indexOf(b) !== -1) {
            cntrolnum++;
          }
        });
        if (cntrolnum > 1) {
          deletion = false;
        }
      }
      if (deletion) {
        if (req.app.locals.tiles[data.file_id] !== undefined) {
          var prop = "";
          switch (data.type) {
            case 'pbf': {
              prop = "geojsonvt";
              break;
            }
            case 'xyz': {
              prop = "geojsonvt";
              break;
            }
            case 'wfs': {
              prop = "geojson";
              break;
            }
          }

          if (req.app.locals.tiles[data.file_id][prop] !== undefined) {
            req.app.locals.tiles[data.file_id][prop]=false;
          }
          if (req.app.locals.tiles[data.file_id][prop] == false) {
            res.send({
              status: true
            });
          } else {
            res.send({
              status: false
            });
          }
        } else {
          res.send({
            status: true
          });
        }
      } else {
        res.send({
          status: true
        });
      }

    });


  },
  run(req, res) {
    console.log("run Hazırlama İsteği Geldi");
    
    var data = req.body;
    var file = data.file;
    var tile = data.tile;
    req.app.locals.sql.checkTile(file.id,tile,function(result){
      if(result.result.length>0){
        req.app.locals.tiles[file.id].tileService[tile]=result.result[0];
        res.send({
          status: true
        });
      }else{
        res.send({
          status: true
        });
      }
    });
    
    /*if(req.app.locals.tiles[data.id]["geojsonvt"]==false){
      req.app.locals.tiles[data.id]["geojsonvt"]=req.app.locals.tiles[data.id]["test"];
      res.send({
        status: true
      });
    }else{
      if(req.app.locals.tiles[data.id]["test"]!==undefined){
        req.app.locals.tiles[data.id]["geojsonvt"]=req.app.locals.tiles[data.id]["test"];
        res.send({
          status: true
        });
      }else{
        res.send({
          status: false
        });
      }
    }*/
  },
  test(req, res) {
    console.log("test Hazırlama İsteği Geldi");
    var data = req.body;
    var geojsont = getGeoJSON(data);
    if (geojsont.geojson == undefined) {
      geojsont.geojson = {
        "type": "FeatureCollection",
        "features": []
      };
    }
    if (geojsont.status) {

      if (req.app.locals.tiles[data.id] == undefined) {
        req.app.locals.tiles[data.id] = {
          file:data,
          source:{
            geojson:false,
            geojsonvt:false
          },
          tileService:{
            pbf:false,
            xyz:false,
            mvt:false,
            wfs:false,
            wms:false,
            wmts:false
          },
          style:{
            test:data.style,
            selected:data.style,
            currentStyle:false
          }
        };
      }
      req.app.locals.tiles[data.id].source["geojson"] = geojsont;
      req.app.locals.tiles[data.id].source["geojsonvt"] = geojsonvt(geojsont.geojson, {
        maxZoom: 22,
        tolerance: 3,
        extent: 4096,
        buffer: 64,
        debug: 0,
        lineMetrics: false,
        promoteId: null,
        generateId: false,
        indexMaxZoom: 5,
        indexMaxPoints: 100000
      });
      res.send({
        status: true
      });
    } else {
      res.send({
        status: false
      });
    }
  }
};