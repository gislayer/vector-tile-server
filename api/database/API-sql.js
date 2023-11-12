const dbname = "gislayer.db";
const sqlite3 = require("sqlite3").verbose();
const path = require('path');
const db_path = path.join(__dirname, "", dbname);

module.exports = {
  db_path:db_path,
  db:null,
  open(){
    this.db = new sqlite3.Database(this.db_path);
  },
  close(){
    if(this.db!==null){
      this.db.close();
      this.db=null;
    }
    
  },
  setStyleToFile(data,callback){
    this.open();
    var data = [data.styleid,data.fileid];
    var sql = "UPDATE files SET style=? WHERE id = ?";
    this.db.run(sql, data, function(err) {
      if (err) {
        callback({status:false});
      }
      if(this.changes>0){
        callback({status:true,result:this.changes})
      }else{
        callback({status:false})
      }
    });
    this.close();
  },
  insertStyle(data,callback){
    var sql = "INSERT INTO styles (name,file_id,point,linestring,polygon,label,status) VALUES (?,?,?,?,?,?,?)";
    this.open();
    this.db.run(sql,[data.name,data.file_id,data.point,data.linestring,data.polygon,data.label,data.status], function(err) {
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:{lastID:this.lastID}});
    });
    this.close();
  },
  getAllStyles(callback){
    this.open();
    var sql = "SELECT * FROM styles ORDER BY name ASC";
    this.db.all(sql,[],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      var styles = {};
      data.map(function(s){
        s.linestring=JSON.parse(s.linestring);
        s.point=JSON.parse(s.point);
        s.polygon=JSON.parse(s.polygon);
        s.label=JSON.parse(s.label);
        styles[s.id]=s;
      });
      callback({status:true,result:styles});
    });
    this.close();
  },
  passiveTileServer(data,callback){
    var file_id = data.file_id;
    var type = data.type;
    var status = 0;
    this.open();
    var data = [status,file_id,type];
    var sql = `UPDATE tiles SET status=? WHERE file_id = ? AND type=?`;
    this.db.run(sql, data, function(err) {
      if (err) {
        callback({status:false});
      }
      if(this.changes>0){
        callback({status:true,result:this.changes})
      }else{
        callback({status:false})
      }
    });
    this.close();
  },
  getWFSServices(callback){
    this.open()
    this.db.all("SELECT * FROM tiles WHERE type= ? AND status=1 ORDER BY id ASC",['wfs'],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  getActiveService(file_id,callback){
    this.open()
    this.db.all("SELECT * FROM tiles WHERE file_id= ? AND status=1 ORDER BY id ASC",[file_id],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  activeTileServer(data,callback){
    var file_id = data.file_id;
    var type = data.type;
    var status = 1;
    this.open();
    var data = [status,file_id,type];
    var sql = `UPDATE tiles SET status=? WHERE file_id = ? AND type=?`;
    this.db.run(sql, data, function(err) {
      if (err) {
        callback({status:false});
      }
      if(this.changes>0){
        callback({status:true,result:{changes:this.changes,file_id:file_id,type:type}})
      }else{
        callback({status:false})
      }
    });
    this.close();
  },
  updateTileServer(data,callback){
    var file_id = data.file_id;
    var type = data.type;
    var name = data.name;
    var settings = data.settings;
    var url = data.url;
    var slug = data.slug;
    this.open();
    var data = [name,settings,url,slug,file_id,type];
    var sql = `UPDATE tiles SET name = ?, settings=?, url=?, slug=? WHERE file_id = ? AND type=?`;
    this.db.run(sql, data, function(err) {
      if (err) {
        callback({status:false});
      }
      if(this.changes>0){
        callback({status:true,result:this.changes})
      }else{
        callback({status:false})
      }
    });
    this.close();

  },
  insertTileServer(data,callback){
    var that = this;
    var file_id = parseInt(data.file_id,10);
    var type = data.type;
    var sql = "INSERT INTO tiles (name,file_id,type,slug,url,settings) VALUES (?,?,?,?,?,?)";
    var sqlCheck = "SELECT * FROM tiles WHERE file_id=? AND type=?";
    this.open();
    this.db.all(sqlCheck,[file_id,type],function(err,checkdata){
      if (err) {
        callback({status:false,result:err.message});
        that.close();
      }
      if(checkdata.length==0){
        that.db.run(sql,[data.name,data.file_id,data.type,data.slug,data.url,data.settings], function(err) {
          if (err) {
            callback({status:false,result:err.message});
          }
          callback({status:true,result:{lastID:this.lastID}});
        });
        that.close();
      }
    });

    
    
  },
  getAllTileList(callback){
    this.open()
    this.db.all("SELECT * FROM tiles ORDER BY id ASC",[],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  checkTile(file_id,tile_type,callback){
    this.open()
    this.db.all("SELECT * FROM tiles WHERE file_id= ? AND type=? ORDER BY id ASC",[file_id,tile_type],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  getTileList(file_id,callback){
    this.open()
    this.db.all("SELECT * FROM tiles WHERE file_id= ? ORDER BY id ASC",[file_id],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  deleteStyle(id,callback){
    id=parseInt(id,10);
    var sql = "DELETE FROM styles WHERE id = ?";
    this.open();
    this.db.run(sql, [id], function(err) {
      if (err) {
        callback({status:false});
      }
      callback({status:true,result:this.changes})
    });
    this.close();
  },
  deleteTile(id,callback){
    id=parseInt(id,10);
    var sql = "DELETE FROM tiles WHERE id = ?";
    this.open();
    this.db.run(sql, [id], function(err) {
      if (err) {
        callback({status:false});
      }
      callback({status:true,result:this.changes})
    });
    this.close();
  },
  deleteStyleUseByFileId(id){
    id=parseInt(id,10);
    var sql = "DELETE FROM styles WHERE file_id = ?";
    this.open();
    this.db.run(sql, [id], function(err) {
    });
    this.close();
  },
  deleteTileUseByFileId(id){
    id=parseInt(id,10);
    var sql = "DELETE FROM tiles WHERE file_id = ?";
    this.open();
    this.db.run(sql, [id], function(err) {

    });
    this.close();
  },
  deleteFile(id,callback){
    id=parseInt(id,10);
    var that = this;
    var sql = "DELETE FROM files WHERE id = ?";
    this.open();
    this.db.run(sql, [id], function(err) {
      if (err) {
        callback({status:false});
      }
      that.deleteTileUseByFileId(id);
      that.deleteStyleUseByFileId(id);
      callback({status:true,result:this.changes})
    });
    this.close();
  },
  updateFile(obj,callback){
    var id = obj.id;
    var data = obj.data;
    this.open();
    var data = [data.name,data.minzoom,data.maxzoom,JSON.stringify(data.tiletypes),data.status,data.epsg, id];
    var sql = `UPDATE files SET name = ?, minzoom=?, maxzoom=?, tiletypes=?, status=?, epsg=?  WHERE id = ?`;
    
    this.db.run(sql, data, function(err) {
      if (err) {
        callback({status:false});
      }
      callback({status:true,result:this.changes})
    });
    this.close();
  },
  getFile(id,callback){
    this.open()
    var sql = `SELECT * FROM files WHERE id  = ?`;
    var idx = parseInt(id,10);
    this.db.get(sql, [idx], (err, row) => {
      if (err) {
        callback({status:false});
      }
      return row
        ? callback({status:true,result:row})
        : callback({status:false});
    });
    this.close();
  },
  getFileList(callback){
    this.open()
    this.db.all("SELECT * FROM files ORDER BY id ASC",[],function(err,data){
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:data});
    });
    this.close();
  },
  insertFile(data,callback){
    this.open();
    this.db.run(`INSERT INTO files(name,extension,path,tiletypes,bbox,fields) VALUES(?,?,?,?,?,?)`, [data.name,data.extension,data.path,data.tiletypes,data.bbox,data.fields], function(err) {
      if (err) {
        callback({status:false,result:err.message});
      }
      callback({status:true,result:{lastID:this.lastID}});
    });
    this.close();
  },
  defineModels(){
    var that = this;
    this.open();
    const file_create = `CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      extension VARCHAR(20) NOT NULL,
      path VARCHAR(200) NOT NULL,
      minzoom INTEGER DEFAULT 0 NOT NULL,
      maxzoom INTEGER DEFAULT 22 NOT NULL,
      tiletypes TEXT NOT NULL,
      status BOOLEAN DEFAULT 1 NOT NULL,
      style INTEGER DEFAULT 1 NOT NULL,
      epsg VARCHAR(50) DEFAULT "EPSG:4326" NOT NULL,
      bbox TEXT DEFAULT "[-180,-90,180,90]" NOT NULL,
      fields TEXT DEFAULT "[]" NOT NULL
    );`;
    
    this.db.run(file_create, err => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Successful creation of the 'files' table");
    });

    //INSERT INTO tiles (name,file_id,type,url,settings,epsg) VALUES (?,?,?,?,?,?)
    const tile_create = `CREATE TABLE IF NOT EXISTS tiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      file_id INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      slug TEXT NOT NULL,
      url TEXT NOT NULL,
      settings TEXT NOT NULL,
      status BOOLEAN DEFAULT 0 NOT NULL
    );`;

    this.db.run(tile_create, err => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Successful creation of the 'tiles' table");
    });


    const style_create = `CREATE TABLE IF NOT EXISTS styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      file_id INTEGER DEFAULT 0 NOT NULL,
      point TEXT NOT NULL,
      linestring TEXT NOT NULL,
      polygon TEXT NOT NULL,
      label TEXT NOT NULL,
      status BOOLEAN DEFAULT 1 NOT NULL
    );`;

    this.db.run(style_create, err => {
      if (err) {
        return console.error(err.message);
      }
      /*that.open();
      console.log("Successful creation of the 'style' table");
      var basestyle = 'INSERT INTO styles(name,point,linestring,polygon,label) VALUES (?,?,?,?,?)';
      var n = 'Default Style';
      var p ='[{"min":0,"max":22,"filters":[],"fillStyle":"rgba(255,0,0,1)","strokeStyle":"rgba(0,0,0,1)","lineWidth":1,"lineCap":"round","lineJoin":"round","radius":3}]';
      var l = '[{"min":0,"max":22,"filters":[],"strokeStyle":"rgba(255,0,0,1)","lineWidth":3,"lineCap":"round","lineJoin":"round"}]';
      var f = '[{"min":0,"max":22,"filters":[],"fillStyle":"rgba(255,0,0,1)","strokeStyle":"rgba(0,0,0,1)","lineWidth":1,"lineCap":"round","lineJoin":"round"}]';
      var t = '[]';
      that.db.run(basestyle,[n,p,l,f,t],function(err){});
      that.close();*/
    });

    this.close();
  }
}