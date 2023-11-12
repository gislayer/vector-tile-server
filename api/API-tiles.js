module.exports = {
  getTiles(req,res){
    req.app.locals.sql.getTileList(req.body.file_id,function(result){
      res.send(result);
    });
  },
  getAllTiles(req,res){
    req.app.locals.sql.getAllTileList(function(result){
      res.send(result);
    });
  },
  saveTileServer(req,res){
    req.app.locals.sql.insertTileServer(req.body.insert,function(result){
      res.send(result);
    });
  },
  updateTileServer(req,res){
    req.app.locals.sql.updateTileServer(req.body.update,function(result){
      res.send(result);
    });
  },
  activeTileServer(req,res){
    req.app.locals.sql.activeTileServer(req.body.active,function(result){
      req.app.locals.tiles[result.result.file_id].tileService[result.result.type].status=1;
      res.send(result);
    });
  },
  passiveTileServer(req,res){
    req.app.locals.sql.passiveTileServer(req.body.active,function(result){
      res.send(result);
    });
  }
};