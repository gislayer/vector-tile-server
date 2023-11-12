Vue.component('filecache', {
	data:function(){
		return {
      obj:false,
      cacheName:'',
      zoomlevels:{min:0,max:15,data:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]},
      serviceTypes:["wfs","wms","wmts","mvt","pbf","xyz"],
      services:{
        pbf:false,
        xyz:false,
        mvt:false,
        wfs:false,
        wms:false,
        wmts:false
      },
      status:false,
      active:{color:"#8bc34a !important"},
      passive:{color:"#808080 !important"},
      filefolder:{selected:'file',data:[{value:'file',text:lang.l.t64},{value:'folder',text:lang.l.t65}]},
      savetype:{selected:'vector',data:[{value:'vector',text:lang.l.t67},{value:'raster',text:lang.l.t68}]},
      folderUrl:GL.userpath+'\\GISLayer\\cache',
      polygon:null,
      emptyslash:"\\",
      tiles:[],
      pclr:{
        c1:'ui black inverted progress',
        c2:'ui orange inverted progress',
        c3:'ui blue inverted progress',
        c4:'ui green inverted progress',
      },
      disabled:false
    }
  },
  methods:{
    open:function(obj){
      this.obj = obj;
      window.ipcRenderer.send('electron', {type:'get-cache-list',data:{id:obj.id}});
      this.polygon = turf.bboxPolygon(JSON.parse(this.obj.bbox));
      this.tiles = this.calCulateTile(JSON.parse(this.obj.bbox));
      this.cacheName = this.obj.name;
    },
    getFolder:function(){
      if(this.disabled==false){
        window.ipcRenderer.send('electron', {type:'get-folder-path',data:{default:this.folderUrl}});
      }
    },
    setFolder:function(url){
      this.folderUrl = url;
    },
    cancel:function(){},
    start:function(){},
    setName:function(){
      this.cacheName = GL.getSlug(this.cacheName);
    },
    latLong2tile(coord, zoom) {
      var xtile = Math.floor((coord[0] + 180) / 360 * Math.pow(2, zoom));
      var ytile = Math.floor((1 - Math.log(Math.tan(coord[1] * Math.PI / 180) + 1 / Math.cos(coord[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      return {
        x: xtile,
        y: ytile,
        z: zoom
      };
    },
    calCulateTile(bbox){
      var newset = [];
      var c1 = [bbox[0],bbox[1]];
      var c2 = [bbox[2],bbox[3]];
      var total = 0;
      for(var i=this.zoomlevels.min;i<=this.zoomlevels.max;i++){
        var tile1 = this.latLong2tile(c1,i);
        var tile2 = this.latLong2tile(c2,i);
        var rangeX = Math.abs(tile1.x-tile2.x)+1;
        var rangeY = Math.abs(tile1.y-tile2.y)+1;
        var cnt = rangeX*rangeY;
        newset.push({zoom:i,count:cnt,now:0,x:tile1.x,y:tile1.y,created:0,status:'start'});
        total+=cnt;
      }
      return {tileset:newset,total:total};
    },
    parcent(min,max){
      var oran = parseFloat((min*100)/max,10);
      return oran.toFixed(2)
    },
    parcent2(min,max){
      var oran = parseFloat((min*100)/max,10);
      if(oran<18){
        oran=18;
      }
      return oran;
    },
    getColor(min,max){
      var oran = parseFloat((min*100)/max,10);
      if(oran==0){
        return this.pclr.c1;
      }else if(oran>0 && oran<50){
        return this.pclr.c2;
      }
      else if(oran>=50 && oran<100){
        return this.pclr.c3;
      }
      else if(oran==100){
        return this.pclr.c4;
      }
    },
    zoomSelected(){
      debugger;
      if(this.zoomlevels.min>this.zoomlevels.max){
        this.zoomlevels.min=this.zoomlevels.max;
      }
      if(this.zoomlevels.max<this.zoomlevels.min){
        this.zoomlevels.max=this.zoomlevels.min;
      }
      this.tiles = this.calCulateTile(JSON.parse(this.obj.bbox));
    },
    tileLoadPart:function(){},
    start(item){
      debugger;
      this.disabled=true;
      GL.setsystemStop(true);
    },
    restart(item){},
    pause(item){}
    
  },
  mounted(){

  },
  template:
  '<div><div class="ui two column stackable grid">'+

    //sol taraf
    '<div class="eight wide column">' +
      '<div class="ui form inverted">'+
        '<h2 class="ui dividing unselect header inverted">{{lang.l.t77}}</h2>'+

        '<div class="field inverted">'+
          '<label class="unselect">{{lang.l.t78}}</label>'+
          '<div class="ui labeled right input inverted mini">'+
            '<input :disabled="disabled" @keyup="setName" class="input1" v-model="cacheName" type="text" :placeholder="lang.l.t78">'+
          '</div>'+
        '</div>'+

        '<div class="field inverted">'+
          '<label class="unselect">{{lang.l.t69}}</label>'+
          '<div class="ui labeled right input inverted mini">'+
            '<input disabled class="input1" :value="folderUrl+emptyslash+cacheName" type="text" :placeholder="lang.l.t69">'+
            '<a @click="getFolder()" class="ui tag label unselect">{{lang.g.browse}}</a>'+
          '</div>'+
        '</div>'+
        
        // Dosya/Klasör Tip Seçimi
        '<div class="field inverted">' +
          '<label class="unselect">{{lang.l.t63}}</label>' +
          '<select :disabled="disabled" v-model="filefolder.selected" style="outline: none;" class="input1"><option v-for="(item,i) in filefolder.data" :value="item.value">{{item.text}}</option></select>' +
        '</div>' +

        // Vector - Raster Seçimi
        '<div class="field inverted">' +
          '<label class="unselect">{{lang.l.t66}}</label>' +
          '<select :disabled="disabled" v-model="savetype.selected" style="outline: none;" class="input1"><option v-for="(item,i) in savetype.data" :value="item.value">{{item.text}}</option></select>' +
        '</div>' +

        // Min Zoom Seviyesi
        '<div class="field inverted">' +
          '<label class="unselect">{{lang.l.t70}}</label>' +
          '<select :disabled="disabled" @change="zoomSelected" v-model="zoomlevels.min" style="outline: none;" class="input1"><option v-for="(item,i) in zoomlevels.data" :value="item">{{item}}</option></select>' +
        '</div>' +

        // Max Zoom Seviyesi
        '<div class="field inverted">' +
          '<label class="unselect">{{lang.l.t71}}</label>' +
          '<select :disabled="disabled" @change="zoomSelected" v-model="zoomlevels.max" style="outline: none;" class="input1"><option v-for="(item,i) in zoomlevels.data" :value="item">{{item}}</option></select>' +
        '</div>' +

        '<div class="field unselect">'+
          '<label class="unselect">{{lang.l.t83}} : {{tiles.total}}</label>' +
          '<table class="ui inverted table"><thead><tr><th style="width: 60px;">Zoom</th><th style="width: 100px;">{{lang.l.t79}}</th><th style="width: 100px;">{{lang.l.t80}}</th><th>{{lang.l.t81}}</th><th style="width: 100px;">{{lang.l.t82}}</th></tr></thead>'+
            '<tr v-for="(item,i) in tiles.tileset">'+
              '<td>{{item.zoom}}</td>'+
              '<td>{{item.count}}</td>'+
              '<td>{{item.created}}</td>'+
              '<td><div class="ui inverted"><div style="margin-bottom: 0;" :class="getColor(item.created,item.count)" data-percent="32"><div class="bar" :style="{width:parcent2(item.created,item.count)+\'%\'}"><div style="font-size: 10px;" class="progress">{{parcent(item.created,item.count)}}%</div></div></div></td>'+
              '<td v-if="item.created==0 && item.status==\'start\'"><button @click="start(item)" class="ui green mini basic button">{{lang.g.start}}</button></td>'+
              '<td v-if="item.created==item.count"><button @click="restart(item)" class="ui olive mini basic button">{{lang.g.restart}}</button></td>'+
              '<td v-if="item.created>0 && item.created!==item.count && item.status==\'running\'"><button @click="pause(item)" class="ui mini orange basic button">{{lang.g.pause}}</button></td>'+
            '</tr>'+
          '</table>'+
        '</div>'+


        '<div class="field">'+
          '<button @click="start" class="ui inverted olive basic button">{{lang.l.t72}}</button>'+
          '<button @click="cancel" class="ui inverted red basic button">{{lang.l.t73}}</button>'+
        '</div>'+

      '</div>' +
    '</div>'+

    //sag taraf
    '<div class="eight wide column">' +
      '<h2 class="ui dividing unselect header inverted">{{lang.l.t74}}</h2>'+
      '<div class="ui form inverted"></div>' +
    '</div>'+
    

  '</div></div>'
  });

