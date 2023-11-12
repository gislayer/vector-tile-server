const vtpbf = require('vt-pbf');

module.exports = {
  getTile(req,res){
    var fileid = req.params.fileid;
    var name = req.params.name;
    var z = parseInt(req.params.z,10);
    var x = parseInt(req.params.x,10);
    var y = req.params.y;
    y = y.replace('.pbf','');
    y=parseInt(y,10);

    if(req.app.locals.tiles[fileid]!==undefined){

      if (req.app.locals.tiles[fileid].tileService.pbf !== false) {

        if (req.app.locals.tiles[fileid].tileService.pbf.status == 1 && req.app.locals.tiles[fileid].tileService.pbf.name.toLowerCase() == name) {

          const tile = req.app.locals.tiles[fileid].source.geojsonvt.getTile(z, x, y);
          if (!tile) {
            res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
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
          res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
          return res.end()
        }
      }else{
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
        return res.end()
      }
    }else{
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
        return res.end()
    }
  },
};