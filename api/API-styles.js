module.exports = {
  createStyle(req,res){
    var data = req.body.insert;
    var fileid = data.file_id;
    var fid = data.fileid;
    req.app.locals.sql.insertStyle(data,function(result){
      if(result.status){
        var id = result.result.lastID;
        
        req.app.locals.sql.setStyleToFile({fileid:fid,styleid:id},function(result1){
          if(result1.result>0){
            req.app.locals.tiles[fid].style.test = id;
            req.app.locals.tiles[fid].style.selected = id;
            req.app.locals.tiles[fid].style.currentstyle = false;
            res.send({status:true,id:id,fid:fid});
          }else{
            res.send({status:false});
          }
        });
      }else{
        res.send({status:false});
      }
     
    });
  },
  changeCurrentTestStyle(req,res){
    var style = req.body.style;
    var fileid = req.body.fileid;
    fileid=parseInt(fileid);
    if(req.app.locals.tiles[fileid]!==undefined){
      req.app.locals.tiles[fileid].style.currentStyle = style;
      res.send({status:true});
    }else{
      res.send({status:false});
    }
  },
  changeTestStyle(req,res){
    var styleid = req.body.styleid;
    var fileid = req.body.fileid;
    styleid=parseInt(styleid);
    fileid=parseInt(fileid);
    req.app.locals.sql.setStyleToFile({fileid:fileid,styleid:styleid},function(result1){
      if(req.app.locals.tiles[fileid]!==undefined){
        req.app.locals.tiles[fileid].style.test = styleid;
        req.app.locals.tiles[fileid].style.selected = styleid;
        req.app.locals.tiles[fileid].style.currentstyle = false;
        res.send({status:true});
      }else{
        res.send({status:false});
      }
    });
    
  }
}