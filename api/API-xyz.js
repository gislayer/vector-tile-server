const vtpbf = require('vt-pbf');
const render = require('./API-render');
//var canvas = require('canvas')

module.exports = {
  getTestTile(req, res) {
    var fileid = req.params.fileid;
    //var styleid = req.params.styleid;
    var z = parseInt(req.params.z, 10);
    var x = parseInt(req.params.x, 10);
    var y = req.params.y;
    y = y.replace('.png', '');
    y = parseInt(y, 10);


    if (req.app.locals.tiles[fileid].style.currentStyle == false) {
      var style = req.app.locals.styles[req.app.locals.tiles[fileid].style.test];
    } else {
      var style = req.app.locals.tiles[fileid].style.currentStyle;
    }

    if (style == undefined) {
      style = {
        label: [],
        point: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "fillStyle": "rgba(255,0,0,1)",
          "strokeStyle": "rgba(0,0,0,1)",
          "lineWidth": 1,
          "lineCap": "round",
          "lineJoin": "round",
          "radius": 3
        }],
        linestring: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "strokeStyle": "rgba(255,0,0,1)",
          "lineWidth": 3,
          "lineCap": "round",
          "lineJoin": "round"
        }],
        polygon: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "fillStyle": "rgba(255,0,0,1)",
          "strokeStyle": "rgba(0,0,0,1)",
          "lineWidth": 1,
          "lineCap": "round",
          "lineJoin": "round"
        }]
      };
    }

    if (req.app.locals.tiles[fileid] !== undefined) {
      const tile = req.app.locals.tiles[fileid].source.geojsonvt.getTile(z, x, y);
      if (!tile) {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*'
        })
        return res.end()
      }

      var img = render({
        layers: [tile],
        style: style
      }, {
        bitmapsize: 256,
        antialias: false,
        zoom: z
      });
      //req.app.locals.GL.sendPBFData({tile:tile,style:style});
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*'
      })
      res.write(img, 'binary')
      res.end(null, 'binary')
    }
  },
  caching(req, res){
    var fileid = req.params.fileid;
    var type = req.params.type;
    var z = parseInt(req.params.z, 10);
    var x = parseInt(req.params.x, 10);
    var y = req.params.y;

    if(type=='vector'){
      y = y.replace('.pbf', '');
    }else{
      y = y.replace('.png', '');
    }
    
    y = parseInt(y, 10);
    var style = req.app.locals.styles[req.app.locals.tiles[fileid].style.selected];
    if (style == undefined) {
      style = {
        label: [],
        point: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "fillStyle": "rgba(255,0,0,1)",
          "strokeStyle": "rgba(0,0,0,1)",
          "lineWidth": 1,
          "lineCap": "round",
          "lineJoin": "round",
          "radius": 3
        }],
        linestring: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "strokeStyle": "rgba(255,0,0,1)",
          "lineWidth": 3,
          "lineCap": "round",
          "lineJoin": "round"
        }],
        polygon: [{
          "min": 0,
          "max": 22,
          "filters": [],
          "fillStyle": "rgba(255,0,0,1)",
          "strokeStyle": "rgba(0,0,0,1)",
          "lineWidth": 1,
          "lineCap": "round",
          "lineJoin": "round"
        }]
      };
    };

    if (req.app.locals.tiles[fileid] !== undefined) {

      if(type=='vector'){
        const tile = req.app.locals.tiles[fileid].source.geojsonvt.getTile(z, x, y);
          if (!tile) {
            res.writeHead(204, { 'Content-Type': 'application/protobuf','Access-Control-Allow-Origin': '*' })
            return res.end()
          }
          const buffer = Buffer.from(vtpbf.fromGeojsonVt({ gislayer: tile }))
          res.writeHead(200, {
            'Content-Type': 'application/protobuf',
            'Access-Control-Allow-Origin': '*'
          })
          res.write(buffer, 'binary')
          res.end(null, 'binary')
      }else{
        const tile = req.app.locals.tiles[fileid].source.geojsonvt.getTile(z, x, y);
          if (!tile) {
            res.writeHead(200, {
              'Content-Type': 'image/png',
              'Access-Control-Allow-Origin': '*'
            })
            return res.end()
          }

          var img = render({
            layers: [tile],
            style: style
          }, {
            bitmapsize: 256,
            antialias: false,
            zoom: z
          });

          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*'
          })
          res.write(img, 'binary')
          res.end(null, 'binary')
      }

    }else{
      if(type=='vector'){
        res.writeHead(200, {
          'Content-Type': 'application/protobuf',
          'Access-Control-Allow-Origin': '*'
        })
        return res.end()
      }else{
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Access-Control-Allow-Origin': '*'
        })
        res.end()
      }
      
    }
  },
  getTile(req, res) {
    var fileid = req.params.fileid;
    var name = req.params.name;
    var z = parseInt(req.params.z, 10);
    var x = parseInt(req.params.x, 10);
    var y = req.params.y;
    y = y.replace('.png', '');
    y = parseInt(y, 10);

    if (req.app.locals.tiles[fileid].tileService.xyz !== false) {

      if (req.app.locals.tiles[fileid].tileService.xyz.status == 1 && req.app.locals.tiles[fileid].tileService.xyz.name.toLowerCase() == name) {

        var style = req.app.locals.styles[req.app.locals.tiles[fileid].style.selected];

        if (style == undefined) {
          style = {
            label: [],
            point: [{
              "min": 0,
              "max": 22,
              "filters": [],
              "fillStyle": "rgba(255,0,0,1)",
              "strokeStyle": "rgba(0,0,0,1)",
              "lineWidth": 1,
              "lineCap": "round",
              "lineJoin": "round",
              "radius": 3
            }],
            linestring: [{
              "min": 0,
              "max": 22,
              "filters": [],
              "strokeStyle": "rgba(255,0,0,1)",
              "lineWidth": 3,
              "lineCap": "round",
              "lineJoin": "round"
            }],
            polygon: [{
              "min": 0,
              "max": 22,
              "filters": [],
              "fillStyle": "rgba(255,0,0,1)",
              "strokeStyle": "rgba(0,0,0,1)",
              "lineWidth": 1,
              "lineCap": "round",
              "lineJoin": "round"
            }]
          };
        }

        if (req.app.locals.tiles[fileid] !== undefined) {
          const tile = req.app.locals.tiles[fileid].source.geojsonvt.getTile(z, x, y);
          if (!tile) {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*'
            })
            return res.end()
          }

          var img = render({
            layers: [tile],
            style: style
          }, {
            bitmapsize: 256,
            antialias: false,
            zoom: z
          });
          //req.app.locals.GL.sendPBFData({tile:tile,style:style});
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*'
          })
          res.write(img, 'binary')
          res.end(null, 'binary')
        }

      } else {
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Access-Control-Allow-Origin': '*'
        })
        res.write(req.app.locals.emptytile, 'binary')
        res.end(null, 'binary')
      }


    } else {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*'
      })
      res.write(req.app.locals.emptytile, 'binary')
      res.end(null, 'binary')
    }








  },
};