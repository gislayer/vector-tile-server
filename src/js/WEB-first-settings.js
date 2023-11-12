const path = require('path');
const fs = require('fs');
const { Titlebar, Color } = require('custom-electron-titlebar');

var mainMenu = new Titlebar({
  backgroundColor: Color.fromHex('#2D2D2D'),
  icon:'favicon.ico',
  shadow:true
});

var rootPath = __dirname;
var lang = fs.readFileSync(__dirname+'/lang/default.json',{encoding:'utf8', flag:'r'});
lang=JSON.parse(lang);
document.getElementById('header1').innerHTML=lang.r.t1;
document.getElementById('header2').innerHTML=lang.r.t11;

