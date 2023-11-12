const proj4 = require('proj4');
const epsg = require('epsg');
const booleanContains = require('@turf/boolean-contains');
const bboxPolygon = require('@turf/bbox-polygon');
const bbox = require('@turf/bbox');
const reproject = require('reproject');
const myWFS = require('./wfs');
const xml = require('xml');

module.exports = {
  getWMS(req,res){
    var fileid = req.params.fileid;
    var name = req.params.name;
    var query = req.query;
    var props = {};
    res.send({});
  },
  getWFS(req,res){
    var fileid = req.params.fileid;
    var name = req.params.name;
    var query = req.query;
    var props = {};

    

    for(var i in query){
      props[i.toLocaleLowerCase()]=query[i];
    }
    var geojson = req.app.locals.tiles[fileid].source.geojson.geojson;
    if(props.service=="WFS"){
      var WMSversions = ['2.0.0','1.1.0','1.0.0'];
      if(WMSversions.indexOf(props.version)!==-1){
        var requests = ['GetFeature','GetCapabilities'];
        if(props['request']!==undefined && requests.indexOf(props['request'])!==-1){

          if(props['request']=='GetCapabilities'){
            myWFS.GetCapabilities(req,function(xmltext){
              res.set('Content-Type', 'text/xml');
              res.send(xmltext);
            });
          }

          if(props['request']=='GetFeature'){
            var typenameControl = props['typename']!==undefined? props['typename']:props['typenames']!==undefined? props['typenames']:false;
            if(typenameControl!==false){
              var typeName = props['typename']!==undefined? props['typename']:props['typenames'];
              if(typeName==name){
                if(props['srsname']!==undefined){
                  var exepsg = props['srsname'];
                  var exportEPSG = epsg[props['srsname']];
                  proj4.defs(props['srsname'],exportEPSG);
                  if(exportEPSG!==undefined){
                    if(props['bbox']!==undefined){
                      var bboxpart = props['bbox'].split(',');
                      if(bboxpart.length==5){
                        var bboxEPSG = epsg[bboxpart[4]];
                        if(bboxpart[4]!=='EPSG:4326'){
                          proj4.defs(bboxpart[4],bboxEPSG);
                          var c1 = [parseFloat(bboxpart[0]),parseFloat(bboxpart[1])];
                          var c2 = [parseFloat(bboxpart[2]),parseFloat(bboxpart[3])];
                          var cr1 = proj4(proj4(exepsg),proj4.WGS84,c1);
                          var cr2 = proj4(proj4(exepsg),proj4.WGS84,c2);
                          var bbox4326 = [cr1[0],cr1[1],cr2[0],cr2[1]];
                          var bboxPol = bboxPolygon.default(bbox4326);
                        }else{
                          var bbox4326 = [bboxpart[0],bboxpart[1],bboxpart[2],bboxpart[3]];
                          var bboxPol = bboxPolygon.default(bbox4326);
                        }
                        
                        var arr = geojson.features.filter(function(f){
                          var b = bboxPolygon.default(bbox.default(f));
                          if(booleanContains.default(bboxPol,b)){
                            return true;
                          }
                        });
                        if(props['maxfeatures']==undefined){
                          var base = { "type": "FeatureCollection", "features": arr };
                          var last = reproject.reproject(base,proj4.WGS84,proj4(exepsg));
                          last.totalFeatures = last.features.length;
                          last.numberMatched = last.features.length;
                          last.numberReturned = last.features.length;
                          var code = exepsg.split(':')[1];
                          last.crs = {type:'name',properties:{name:'urn:ogc:def:crs:EPSG::'+code}};
                          last.timeStamp = new Date().toISOString();
                          res.status(200).json(last)
                        }else{
                          var son = parseInt(props['maxfeatures'],10);
                          if(son>arr.length){
                            son=arr.length;
                          }
                          var arr2 = arr.splice(0,son);
                          var base = { "type": "FeatureCollection", "features": arr2 };
                          var last = reproject.reproject(base,proj4.WGS84,proj4(exepsg));
                          last.totalFeatures = last.features.length;
                          last.numberMatched = last.features.length;
                          last.numberReturned = last.features.length;
                          var code = exepsg.split(':')[1];
                          last.crs = {type:'name',properties:{name:'urn:ogc:def:crs:EPSG::'+code}};
                          last.timeStamp = new Date().toISOString();
                          res.status(200).json(last)
                        }
                      }else{
                        res.send({status:false,error:req.app.locals.lang.msg.m49});
                      }
                    }else{
                      res.send({status:false,error:req.app.locals.lang.msg.m48});
                    }
                  }else{
                    res.send({status:false,error:req.app.locals.lang.msg.m46});
                  }
                }else{
                  res.send({status:false,error:req.app.locals.lang.msg.m45});
                }
              }else{
                res.send({status:false,error:req.app.locals.lang.msg.m44+'=> Typename : '+typeName+', Layer Name  : '+name});
              }
            }else{
              res.send({status:false,error:req.app.locals.lang.msg.m43});
            }
          }
          
        }else{
          res.send({status:false,error:req.app.locals.lang.msg.m47});
        }
      }else{
        res.send({status:false,error:req.app.locals.lang.msg.m42});
      }
    }else{
      myWFS.GetCapabilities(req,function(xmltext){
        res.set('Content-Type', 'text/xml');
        res.send(xmltext);
      });
    }

    
  }
}