const { exec } = require("child_process");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const config = require('./config');
var API_URL = config.api[config.mode];


/* API ÇAlıştırılıyor */
exec(config.runApi, (a,b,c)=>{
  console.log(a);
  console.log(b);
  console.log(c);
})

const { app, BrowserWindow, Menu, dialog, remote, ipcMain, Notification, clipboard  } = require('electron')

/* Dil Paketi Yükleniyor */
var countries = require('./lang/countyCodes');
var loc = app.getLocaleCountryCode();
var loclng = "en";
if(countries[loc]!==undefined){
  var locInfo = countries[loc];
  global.locInfo = locInfo;
  loclng = locInfo.lang;
}else{
  global.locInfo = {code:"",name:"",localname:"",language:[],lang:"en"};
}
var lang = fs.readFileSync(__dirname+'/lang/'+loclng+'.json',{encoding:'utf8', flag:'r'});
lang=JSON.parse(lang);
lang.country = global.locInfo;
fs.writeFileSync(__dirname+'/lang/default.json',JSON.stringify(lang),{encoding:'utf8', flag:'w'})
global.lang=lang;
global.path = app.getPath('home');

/* GL Bağlantıları Kuruluyor */
const GL = require('./GL-electron');
global.GL = GL;
GL.setDialog(dialog);
GL.setRemote(remote);
GL.setClipboard (clipboard);
GL.setNotification(Notification);
GL.userpath = global.path;
if (!fs.existsSync(GL.userpath+'/GISLayer')){
  fs.mkdirSync(GL.userpath+'/GISLayer');
}
if (!fs.existsSync(GL.userpath+'/GISLayer/data')){
  fs.mkdirSync(GL.userpath+'/GISLayer/data');
}
if (!fs.existsSync(GL.userpath+'/GISLayer/cache')){
  fs.mkdirSync(GL.userpath+'/GISLayer/cache');
}

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    title:config.title,
    width: 800,
    height: 600,
    icon: __dirname + '/favicon.ico',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    backgroundColor: '#1E1E1E',
    frame: false
  })

  win.maximize();

  //win.setProgressBar(0.5)

/* Web Kodları Ekleniyor */
  win.loadFile('index.html')

  
  //webden buraya gelen istekler
  ipcMain.on('electron', (event, msg) => {
    console.log("Post From Web : "+JSON.stringify(msg.data));
    GL.pingpong(msg);
  })

  // Open the DevTools.
  win.webContents.openDevTools()

  GL.setWindow(win);

  

  
}


app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  /* API Durduruluyor */
  axios.get(API_URL+"/close").then(function(){
    axios.get(API_URL+"/status").then(function(){});
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function menuCreator (){
  return Menu.buildFromTemplate([
    {
        label: lang.menu.file,
            submenu: [
            {
              label:lang.menu.vectoradd,
              submenu:[
                {
                  label:lang.menu.shp,
                  click() {
                    GL.openDialog({ name: lang.menu.shpdialog, extensions: ['shp','dbf'] });               
                  }
                },
                {
                  label:lang.menu.mbtiles,
                  click() {
                    GL.openDialog({ name: lang.menu.mbtilesdialog, extensions: ['mbtiles'] });               
                  }
                },
                {
                  label:lang.menu.gpkg,
                  click() {
                    GL.openDialog({ name: lang.menu.gpskdialog, extensions: ['gpkg'] });               
                  }
                },
                {
                  label:lang.menu.geojson,
                  click() {
                    GL.openDialog({ name: lang.menu.geojsondialog, extensions: ['geojson'] });
                  }
                },
                {
                  label:lang.menu.kml,
                  click() {
                    GL.openDialog({ name: lang.menu.kmldialog, extensions: ['kml'] });
                  }
                },
                {
                  label:lang.menu.kmz,
                  click() { 
                    GL.openDialog({ name: lang.menu.kmzdialog, extensions: ['kmz'] });
                  }
                },
                {
                  label:lang.menu.gpx,
                  click() {
                    GL.openDialog({ name: lang.menu.gpxdialog, extensions: ['gpx'] });
                  }
                },
                {
                  label:lang.menu.wkt,
                  click() {
                    GL.openDialog({ name: lang.menu.wktdialog, extensions: ['wkt'] });
                  }
                },
                {
                  label:lang.menu.dxf,
                  click() {
                    GL.openDialog({ name: lang.menu.dxfdialog, extensions: ['dxf'] });
                  }
                }
                
              ]
            },
            {
              label:lang.menu.addRaster,
              submenu:[
                {
                  label:lang.menu.geotiff,
                  click() {
                    GL.openDialog({ name: lang.menu.geotiffdialog, extensions: ['geotiff'] });
                  }
                },
                {
                  label:lang.menu.tiff,
                  click() {
                    GL.openDialog({ name: lang.menu.tiffdialog, extensions: ['tiff'] });
                  }
                },
                {
                  label:lang.menu.img,
                  click() {
                    GL.openDialog({ name: lang.menu.imgdialog, extensions: ['png','jpg','gif','jpeg'] });
                  }
                },
                
              ]
            }
        ]
    },
    {
      label:lang.menu.service,
      submenu:[
        {
          label:lang.menu.wfs,
          click(){
  
          }
        },
        {
          label:lang.menu.wms,
          click(){
            
          }
        },
        {
          label:lang.menu.mvt,
          click(){
            
          }
        },
        {
          label:lang.menu.pbf,
          click(){
            
          }
        },
        {
          label:lang.menu.xyz,
          click(){
            
          }
        }
      ]
    },
    {
      label:lang.menu.settings,
      submenu:[
        {
          label:lang.menu.language,
          submenu:[
            {
              label:lang.menu.english,
              click(){
                if(GL.systemStop==false){
                var l = fs.readFileSync(__dirname+'/lang/en.json',{encoding:'utf8', flag:'r'});
                fs.writeFileSync(__dirname+'/lang/default.json',l,{encoding:'utf8', flag:'w'})
                l=JSON.parse(l);
                lang=l;
                global.lang=l;
                GL.changelanguage(function(status){
                  if(status){
                    var appmenu = menuCreator();
                    Menu.setApplicationMenu(appmenu); 
                    GL.refreshMenu(lang);
                  }
                });
                }else{
                  GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m50})
                }
              }
            },
            {
              label:lang.menu.turkish,
              click(){
                if(GL.systemStop==false){
                  var l = fs.readFileSync(__dirname+'/lang/tr.json',{encoding:'utf8', flag:'r'});
                  fs.writeFileSync(__dirname+'/lang/default.json',l,{encoding:'utf8', flag:'w'})
                  l=JSON.parse(l);
                  lang=l;
                  global.lang=l;
                  GL.changelanguage(function(status){
                    if(status){
                      var appmenu = menuCreator();
                      Menu.setApplicationMenu(appmenu); 
                      GL.refreshMenu(lang);
                    }
                  });
                }else{
                  GL.win.webContents.send('web', {type:'GL-uyari',data:lang.msg.m50})
                }
              }
            },
            {
              label:'Development',
              click(){
                GL.win.webContents.openDevTools()
              }
            }
          ]
        }
      ]
    }
  ]);
}

var appmenu = menuCreator();
Menu.setApplicationMenu(appmenu); 


app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--open-map',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'Haritayı Aç',
    description: 'Haritayı Açar'
  }
])

const configDir = app.getAppPath();
GL.setRoot(configDir);
GL.setApp(app);


