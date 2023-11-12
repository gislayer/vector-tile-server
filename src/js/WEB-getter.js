const { ipcRenderer } = require('electron');
function init() {
  // add global variables to your web page
  window.isElectron = true
  window.ipcRenderer = ipcRenderer
}

init();

if (window.isElectron) {
  //elektron dan bir emir gelirse burayı izliyor
  window.ipcRenderer.on('web', (event, msg) => {
    console.log("Post From Electron : "+JSON.stringify(msg));
    switch(msg.type){
      case 'test':{
        break;
      }
      case 'get-folder-path':{
        debugger;
        if(msg.data!==false){
          filetab.$children[0].caching.$children[0].setFolder(msg.data);
        }
        break;
      }
      case 'change-test-url':{
        filetab.$children[0].style.$children[0].updateTile();
        break;
      }
      case 'user-path':{
        GL.userpath = msg.data;
        break;
      }
      case 'style-update1':{
        GL.styles = msg.data;
        break;
      }
      case 'style-update2':{
        GL.styles = msg.data.stylelist;
        var styles = [];
        for (var i in GL.styles) {
          var style = GL.styles[i];
          if (style.file_id == 0 || style.file_id == msg.data.fid) {
            styles.push(style);
          }
        }
        filetab.$children[0].style.$children[0].styles.data = styles;
        filetab.$children[0].style.$children[0].styles.selected =msg.data.selected;
        break;
      }
      case 'pbf-to-png':{
        GL.pbfToPng(msg.data);
        break;
      }
      case 'get-tiles':{
        if(filetab.$children[0].tileserver!==false){
          filetab.$children[0].tileserver.$children[0].setCurrentTiles(msg.data);
        }
        break;
      }
      case 'fileDelete':{
        if(msg.data.status==true){

        }
        break;
      }
      case 'get-file':{
        filetab.$children[0].bilgi.$children[0].setFile(msg.data.result);
        if(filetab.$children[0].tileserver!==false){
          filetab.$children[0].tileserver.$children[0].setFile(msg.data.result);
        }
        break;
      }
      case 'filelist-refresh':{
        filelist.$children[0].setFiles(msg.data);
        break;
      }
      case 'GL-onay':{
        GL.onay(msg.data);
        break;
      }
      case 'GL-uyari':{
        GL.uyari(msg.data);
        break;
      }
      case 'GL-hata':{
        GL.hata(msg.data);
        break;
      }
      case 'auto-file-delete':{
        filetab.$children[0].bilgi.$children[0].deletefile2(msg.data);
        break;
      }
      case 'refresh-menu':{
        location.reload();
        break;
      }
    }
  })

}