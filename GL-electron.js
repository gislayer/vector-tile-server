const fs = require('fs');
const { dialog } = require('electron')
const axios = require('axios');
const config = require('./config');

const GL = {
  win:null,
  dialog:null,
  Notification:null,
  clipboard:null,
  root:'',
  app:null,
  api:null
};

GL.userpath = '';

GL.systemStop = false;
GL.setsystemStop = function(status){
  GL.systemStop=status;
}

GL.setApi = function(api){
  this.api=api;
}

GL.setApp = function(app){
  this.app=app;
}

GL.setRoot = function(root){
  GL.root=root;
}

GL.setWindow = function(w){
  this.win=w;
}

GL.setClipboard = function(clipboard){
  this.clipboard=clipboard;
}

GL.copyText = function(text){
  this.clipboard.writeText(text, 'selection')
}

GL.setDialog=function(d){
  this.dialog=d;
};

GL.setRemote=function(r){
  this.remote=r;
};

GL.setNotification=function(n){
  this.Notification=n;
};

GL.API_URL = config.api[config.mode];

GL.API = {
  status:GL.API_URL+'/status',
  changelanguage:GL.API_URL+'/changelanguage',
  readygeojsonvt:GL.API_URL+'/readyGeojsonVT',
  stopgeojsonvt:GL.API_URL+'/stopGeojsonVT',
  startGeojson:GL.API_URL+'/startGeojson',
  styletest:GL.API_URL+'/styletest',
  allstyles:GL.API_URL+'/allstyles',
  addfile:GL.API_URL+'/addfile',
  getfiles:GL.API_URL+'/getfiles',
  getfile:GL.API_URL+'/getfile',
  updatefile:GL.API_URL+'/updatefile',
  deletefile:GL.API_URL+'/deletefile',

  gettiles:GL.API_URL+'/gettiles',
  getalltiles:GL.API_URL+'/getalltiles',
  savetileserver:GL.API_URL+'/savetileserver',
  updatetileserver:GL.API_URL+'/updatetileserver',
  activetileserver:GL.API_URL+'/activetileserver',
  passivetileserver:GL.API_URL+'/passivetileserver',
  fieldbbox:GL.API_URL+'/fieldbbox',

  changeTestStyle:GL.API_URL+'/changeTestStyle',
  changeCurrentTestStyle:GL.API_URL+'/changeCurrentTestStyle',
  createstyle:GL.API_URL+'/createstyle',
}

GL.changelanguage = function(callback){
  axios.get(GL.API.changelanguage).then(function(res){
    if(res.data.status){
      callback(true);
    }
  });
}

GL.tileServiceActive = function(obj,callback){
  var query = {
    file_id:obj.data.file_id,
    type:obj.data.type
  };

  GL.getFile({id:obj.data.file_id},function(result){
    if(result.status){
      axios.post(GL.API.readygeojsonvt, {file:result.result,tile:query.type}).then(function(result){
        if(result.data.status==true){
          axios.post(GL.API.activetileserver, {active:query}).then(function(result1){
            if(result1.data.status){
              callback({status:true});
            }else{
              callback({status:false});
            }
          });
        }else{
          callback({status:false});
        }
      });
    }else{
      callback({status:false,message:lang.msg.m25.content});
    }
  });
}

GL.tileServiceStop = function(obj,callback){
  var query = {
    file_id:obj.data.file_id,
    type:obj.data.type
  };
  axios.post(GL.API.stopgeojsonvt, query).then(function(result){
    if(result.data.status==true){
      axios.post(GL.API.passivetileserver, {active:query}).then(function(result1){
        if(result1.data.status){
          callback({status:true});
        }else{
          callback({status:false});
        }
      });
    }else{
      callback({status:false});
    }
  });
  
}

GL.tileUpdate = function(obj,callback){
  var updateObj = {
    name:obj.name,
    slug:obj.slug,
    file_id:obj.file_id,
    type:obj.type,
    url:obj.url,
    settings:obj.settings
  };
  axios.post(GL.API.updatetileserver, {update:updateObj}).then(function(result){
    if(result.data.status==true){
      callback({status:true,result:result.data.result});
    }else{
      callback({status:false});
    }
  });
}

GL.saveTileServer = function(obj,callback){
  var insertObj = {
    name:obj.name,
    slug:obj.slug,
    file_id:obj.file_id,
    type:obj.type,
    url:obj.url,
    settings:obj.settings
  };
  axios.post(GL.API.savetileserver, {insert:insertObj}).then(function(result){
    if(result.data.status==true){
      callback({status:true,result:result.data.result});
    }else{
      callback({status:false,message:result.result});
    }
  });
}

GL.getTile = function(id,callback){
  /*db_tiles.read(id).then(function(data){
    if(data!==null){
      callback({status:true,type:'findOne',data:data});
    }else{
      callback({status:false,message:"Bu Tile bilgileri alınamıyor. Lütfen tekrar deneyiniz."});
    }
  });*/
}

GL.getTiles = function(query,callback){
  var file_id=query.file_id;
  file_id=parseInt(file_id,10);
  axios.post(GL.API.gettiles, {file_id:file_id}).then(function(result){
    if(result.data.status==true){
      callback({status:true,data:result.data.result});
    }else{
      callback({status:false,message:lang.msg.m26.content});
    }
  });
}

GL.getAllTiles = function(callback){
  axios.get(GL.API.getalltiles).then(function(result){
    if(result.data.status==true){
      callback({status:true,data:result.data.result});
    }else{
      callback({status:false,message:lang.msg.m26.content});
    }
  });
}


GL.openDialog = function(filters){
  if(GL.systemStop==false){
    var that = this;
    var prop = ['openFile','multiSelections'];
    var filetimes = Date.now();
    this.dialog.showOpenDialog(this.win, {
      title:lang.msg.m27,
      properties:prop,
      filters: [filters]
    }).then(result => {
      if(result.canceled==false){
        var paths = result.filePaths;
        paths.map(function(path){
          var pathSplit = path.split('\\');
          var filename = pathSplit[pathSplit.length-1];
          var filenameSplit = filename.split('.');
          var extension = filenameSplit[filenameSplit.length-1];
          filenameSplit.pop();
          var name = filenameSplit.join('.');
          var t = Date.now();
          var extension2=extension;
          if(extension2=="dbf"){
            extension2="shp";
          }
          var newPath = GL.root+'/data/'+extension2+'-'+filetimes+'.'+extension;
          fs.copyFile(path, newPath, (err) => {
            if (err) throw err;
            if(extension=='dbf'){
              return false;
            }
            var types = {
              pbf:true,
              xyz:true,
              mvt:true,
              wfs:true,
              wms:true,
              wmts:true
            };

            var data = {
              name:name,
              extension:extension,
              path:newPath,
              tiletypes:JSON.stringify(types)
            }
            axios.post(GL.API.fieldbbox,data).then(function(bf){
              if(bf.data.status){
                data.fields = JSON.stringify(bf.data.result.fields);
                data.bbox = JSON.stringify(bf.data.result.bbox);
                axios.post(GL.API.addfile,data).then(function(result){
                  if(result.data.status){
                    data.id = result.data.result.lastID;
                    axios.post(GL.API.styletest, data).then(function(result){
                      if(result.data.status==true){
                        GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m8.title,content:lang.msg.m8.content+' '+name+'.'+extension}});
                        GL.getFileList();
                      }else{
                        callback({status:false});
                      }
                    });
                  }else{
                    GL.win.webContents.send('web', {type:'GL-hata',data:{title:lang.msg.m9.title,content:lang.msg.m9.content+' '+name+'.'+extension}})
                  }
                })
              }else{
                GL.deleteFile(data.path,function(st){
                  GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m40})
                });
              }
            });
            
            
            
          });
        });
      }
    }).catch(err => {
      console.log(err)
    })
  }else{
    GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m50})
  }
}

GL.sendPBFData = function(obj){
  GL.win.webContents.send('web', {type:'pbf-to-png',data:obj})
}

GL.getFile = function(data,callback){
  axios.post(GL.API.getfile, {id:data.id}).then(function(result){
    if(result.data.status==true){
      result.data.result.tiletypes=JSON.parse(result.data.result.tiletypes);
      callback({status:true,result:result.data.result});
    }else{
      GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m24})
    }
  });
}

GL.fileUpdate = function(data,callback){
  axios.post(GL.API.updatefile, {id:data.query.id,data:data.data}).then(function(result){
    if(result.data.status==true){
      if(result.data.result>0){
        if(result.data.result>0){
          callback({status:true});
        }else{
          callback({status:false});
        }
      }else{
        callback({status:false});
      }
    }else{
      callback({status:false});
    }
  });
}

GL.getAllFiles = function(callback){
  axios.get(GL.API.getfiles).then(function(result1){
    if(result1.data.status){
      var list = [];
      result1.data.result.map(function(a){
        a.tiletypes=JSON.parse(a.tiletypes);
        list.push(a);
      });
      callback(list);
    }
  });
}

GL.getFileList = function(){
  axios.get(GL.API.getfiles).then(function(result1){
    if(result1.data.status){
      var list = [];
      result1.data.result.map(function(a){
        a.tiletypes=JSON.parse(a.tiletypes);
        list.push(a);
      });
      GL.win.webContents.send('web', {type:'filelist-refresh',data:list})
    }
  });
}

GL.deleteFile = function(path,callback){
  fs.unlink(path,function(err){
    if(err){
      callback(false);
    }else{
      callback(true);
    }
  });
}

GL.fileDelete = function(id,callback){
  id=parseInt(id,10);
  GL.getFile({id:id},function(result){
    if(result.status){
      var path = result.result.path;
      var isHave = fs.existsSync(path);
      axios.post(GL.API.deletefile, {id:id}).then(function(result1){
        if(result1.data.status==true){
          if(isHave==true){
            try {
              fs.unlinkSync(path)
            } catch(err) {
              callback({status:false});
            }
          }
          if(result1.data.result>0){
            callback({status:true});
          }else{
            callback({status:false});
          }
          
        }else{
          callback({status:false});
        }
      });
    }else{
      GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m25})
    }
  })
}

GL.getFolderPath = function(path,callback){
  dialog.showOpenDialog(this.win, {
    defaultPath:path,
    properties: ['openDirectory']
  }).then(result => {
    if(result.canceled==false){
      callback(result.filePaths[0]);
    }else{
      callback(false);
    }    
  }).catch(err => {
    callback(false);
  })
}

GL.fileSaveAs = function(id,callback){
  id = parseInt(id,10);
  GL.getFile({id:id},function(result){
    if(result.status){
      var data = result.result;
      if(data!==null){
        var name = data.name;
        var extension = data.extension;
        var file = name+'.'+extension;
        var path = data.path;
        var options = {
          title: lang.msg.m29,
          defaultPath : file,
          buttonLabel : lang.g.save,
  
          filters :[
            {name: extension.toUpperCase()+' '+lang.g.tofile, extensions: [extension]}
           ]
        }

        var isHave = fs.existsSync(path);
        if(isHave==true){
          dialog.showSaveDialog( this.win, options).then(function(file){
            if (!file.canceled) {
              fs.copyFile(path, file.filePath, (err) => { 
                if (err) { 
                  GL.win.webContents.send('web', {type:'GL-uyari',data:{title:lang.msg.m30,content:err}})
                } 
                else { 
                  console.log(file.filePath.toString()); 
                } 
              }); 
            }
          });
        }else{
          GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m25});
          GL.win.webContents.send('web', {type:'auto-file-delete',data:{id:id,header:lang.msg.m31.title,content:lang.msg.m31.content}});
        }
        
      }else{
        GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m32});
      }
    }else{
      GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m25});
      
    }
    
  });
}

GL.changeTestStyle = function(obj,callback){
  axios.post(GL.API.changeTestStyle, {styleid:obj.styleid,fileid:obj.fileid}).then(function(result){
    callback(result.data);
  });
}
GL.changeCurrentTestStyle = function(obj,callback){
  axios.post(GL.API.changeCurrentTestStyle, {style:obj.style,fileid:obj.fileid}).then(function(result){
    callback(result.data);
  });
}

GL.loadStyles = function(callback){
  axios.get(GL.API.allstyles).then(function(res){
    if(res.data.status){
      callback(res.data.result);
    }
  });
}

GL.loadActiveTiles = function(callback){
   //xxx
   GL.getAllTiles(function(result){
     if(result.status){
       var tiles = result.data;
       function activeTiles(i,arr){
         if(i<arr.length){
          var query = arr[i];
          if(query.status==1){
            axios.post(GL.API.readygeojsonvt, {file:{id:query.file_id},tile:query.type}).then(function(result){
              i++;
              activeTiles(i,arr);
            });
          }else{
            i++;
            activeTiles(i,arr);
          }
         }else{
          callback(true);
         }
       }
       activeTiles(0,tiles);
      
     }
    callback(result)
   });
}

GL.loadAllFiles = function(callback){
  
  GL.getAllFiles(function(files){
    function load(i,data){
      if(i<data.length){
        var file = data[i];
        axios.post(GL.API.styletest, file).then(function(result){
          if(result.data.status==true){
            i++;
            load(i,data);
          }else{
            i++;
            load(i,data);
          }
        });
      }else{
        GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m33});
        callback(true);
      }
    }
    load(0,files);
  })
}

GL.whenAPIReadyDoIt = function(){
  axios.get(GL.API.status).then(function(res){
    if(res.data.status){
      GL.getFileList();
      GL.loadStyles(function(list){
        GL.win.webContents.send('web', {type:'style-update1',data:list});
        GL.loadAllFiles(function(s){
          GL.loadActiveTiles(function(s2){

          })
        });
      });
      
    }
  }).catch(function(){
    GL.whenAPIReadyDoIt();
  });
}

GL.createStyle = function(data,callback){
  axios.post(GL.API.createstyle,data).then(function(res){
    if(res.data.status){
      GL.loadStyles(function(list){
        GL.win.webContents.send('web', {type:'style-update2',data:{stylelist:list,selected:res.data.id,fid:res.data.fid}});
      });
      callback({status:true});
    }else{
      callback({status:false});
    }
  }).catch(function(){
    callback({status:false});
  });
}

GL.latLong2tile=function(coord, zoom) {
  var xtile = Math.floor((coord[0] + 180) / 360 * Math.pow(2, zoom));
  var ytile = Math.floor((1 - Math.log(Math.tan(coord[1] * Math.PI / 180) + 1 / Math.cos(coord[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  return {
    x: xtile,
    y: ytile,
    z: zoom
  };
},

GL.caching = function(data,callback){
  var bbox = data.bbox;
  var path = data.path;
  var type = data.type;
  var filetype = data.filetype;
  var level = data.level;
  var zoom = level.zoom;

  var c1 = [bbox[0],bbox[1]];
  var c2 = [bbox[2],bbox[3]];

  var tile1 = GL.latLong2tile(c1,i);
  var tile2 = GL.latLong2tile(c2,i);

  var nowX=level.x;
  var nowY=level.y;

  function downTile(x,y,maxX,maxY){
    
  }

  downTile(nowX,nowY,tile2.x,tile2.y);

}

//webden buraya gelen istekler
GL.pingpong = function(msg){
  switch(msg.type){
    case 'test':{
      break;
    }
    case 'system-status':{
      GL.setsystemStop(msg.data);
      break;
    }
    case 'add-style':{
      GL.createStyle(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m38})
        }else{
          GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m39})
        }
      });
      break;
    }
    case 'change-currenttest-style':{
      GL.changeCurrentTestStyle(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'change-test-url',data:{}})
          //GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m34})
        }else{
          //GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m35})
        }
      })
      break;
    }
    case 'change-test-style':{
      GL.changeTestStyle(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'change-test-url',data:{}})
          GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m34})
        }else{
          GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m35})
        }
      })
      break;
    }
    case 'canvas-loaded':{
      GL.api.locals.canvas = msg.data;
      break;
    }
    case 'web-loaded':{
      GL.win.webContents.send('web', {type:'user-path',data:GL.userpath})
      GL.whenAPIReadyDoIt();
      break;
    }
    case 'stop-tile-service':{
      GL.tileServiceStop(msg,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m10.title,content:lang.msg.m10.content+''+msg.data.type}})
          GL.getTiles({file_id:msg.data.file_id},function(results){
            GL.win.webContents.send('web', {type:'get-tiles',data:results})
          });
        }else{
          GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m11})
        }
      });
      break;
    }
    case 'active-tile-service':{
      GL.tileServiceActive(msg,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m12.title,content:lang.msg.m12.content+msg.data.type}})
          GL.getTiles({file_id:msg.data.file_id},function(results){
            GL.win.webContents.send('web', {type:'get-tiles',data:results})
          });
        }else{
          GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m13})
        }
      });
      break;
    }
    case 'update-tile-server':{
      msg.data.settings = JSON.stringify(msg.data.settings);
      GL.tileUpdate(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m14.title,content:lang.msg.m14.content+msg.data.type}});
          GL.getTiles({file_id:msg.data.file_id},function(results){
            GL.win.webContents.send('web', {type:'get-tiles',data:results});
          });
        }else{
          GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m15})
        }
      });
      break;
    }
    case 'save-tile-server':{
      msg.data.settings = JSON.stringify(msg.data.settings);
      GL.saveTileServer(msg.data,function(results){
        if(results.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m16.title,content:lang.msg.m16.content+msg.data.type}})
          GL.getTiles({file_id:msg.data.file_id},function(results){
            GL.win.webContents.send('web', {type:'get-tiles',data:results})
          });
        }else{
          GL.win.webContents.send('web', {type:'GL-hata',data:{title:lang.msg.m17.title,content:result.message}})
        }
        
      });
      break;
    }
    case 'get-tiles':{
      GL.getTiles({file_id:msg.data.file_id},function(results){
        GL.win.webContents.send('web', {type:'get-tiles',data:results})
      });
      break;
    }
    case 'copytext':{
      GL.copyText(msg.data.text);
      GL.win.webContents.send('web', {type:'GL-onay',data:{title:lang.msg.m18.title,content:msg.data.text}})
      break;
    }
    case 'file-delete':{
      GL.fileDelete(msg.data.id,function(result){
        if(result.status==false){
          GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m19})
        }else{
          GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m20.title})
          GL.win.webContents.send('web', {type:'file-delete',data:{status:true}});
          GL.getFileList();
        }
      });
      break;
    }
    case 'file-download':{
      GL.fileSaveAs(msg.data.id,function(result){
        if(result.status==false){
          GL.win.webContents.send('web', {type:'GL-hata',data:{title:lang.msg.m21.title,content:result.message}})
        }
      });
      break;
    }
    case 'get-folder-path':{
      GL.getFolderPath(msg.data.default,function(result){
        GL.win.webContents.send('web', {type:'get-folder-path',data:result})
      });
      break;
    }
    case 'file-list':{
      GL.getFileList();
      break;
    }
    case 'file-update':{
      GL.fileUpdate(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m22});
          GL.getFileList();
        }else{
          GL.win.webContents.send('web', {type:'GL-hata',data:lang.msg.m23})
        }
      });
      break;
    }
    case 'get-file':{
      GL.getFile(msg.data,function(result){
        if(result.status){
          GL.win.webContents.send('web', {type:'get-file',data:result})
        }
      });
      break;
    }
  }
}

GL.refreshMenu = function(data){
  GL.win.webContents.send('web', {type:'GL-onay',data:lang.msg.m1});
  GL.win.webContents.send('web', {type:'refresh-menu',data:data})
}



module.exports = GL;