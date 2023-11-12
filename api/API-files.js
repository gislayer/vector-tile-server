module.exports = {
  deletefile(req,res){
    req.app.locals.sql.deleteFile(req.body.id,function(result){
      res.send(result);
    });
  },
  updatefile(req,res){
    req.app.locals.sql.updateFile({id:req.body.id,data:req.body.data},function(result){
      res.send(result);
    });
  },
  getfile(req,res){
    req.app.locals.sql.getFile(req.body.id,function(result){
      res.send(result);
    });
  },
  filelist(req,res){
    req.app.locals.sql.getFileList(function(result){
      res.send(result);
    });
  },
  add(req,res){
    console.log("Yeni Dosya Ekleme Talebi geldi");
    var data = req.body;
    var status = true;
    var name = data["name"]==undefined?'Unnamed File':data["name"];
    var extension = data["extension"]==undefined?status=false:data["extension"];
    var path = data["path"]==undefined?status=false:data["path"];
    var tiletypes = data["tiletypes"]==undefined?status=false:data["tiletypes"];
    if(status){
      var data = {
        name:name,
        extension:extension,
        path:path,
        tiletypes:tiletypes,
        fields:data.fields,
        bbox:data.bbox
      };
      req.app.locals.sql.insertFile(data,function(result){
        res.send(result);
      });
    }else{
      res.send({status:false});
    }
    
  }
}