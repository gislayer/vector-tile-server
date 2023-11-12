const { language } = require('custom-electron-titlebar/lib/common/platform');

Vue.component('filelist', {
	data:function(){
		return {
      dataTypes:[
        {
          label:lang.r.t2,
          icon:'',
          active:false,
          num:0,
          extension:'shp',
          files:[]
        },
        {
          label:lang.r.t3,
          icon:'',
          active:false,
          num:0,
          extension:'geojson',
          files:[]
        },
        {
          label:lang.r.t4,
          icon:'',
          active:false,
          num:0,
          extension:'kml',
          files:[]
        },
        {
          label:lang.r.t5,
          icon:'',
          active:false,
          num:0,
          extension:'kmz',
          files:[]
        },
        {
          label:lang.r.t6,
          icon:'',
          active:false,
          num:0,
          extension:'gpx',
          files:[]
        },
        {
          label:lang.r.t7,
          icon:'',
          active:false,
          num:0,
          extension:'wkt',
          files:[]
        },
        {
          label:lang.r.t8,
          icon:'',
          active:false,
          num:0,
          extension:'dxf',
          files:[]
        },
        {
          label:lang.r.t9,
          icon:'',
          active:false,
          num:0,
          extension:'mbtiles',
          files:[]
        },
        {
          label:lang.r.t10,
          icon:'',
          active:false,
          num:0,
          extension:'gpkg',
          files:[]
        }
      ]
    }
  },
  methods:{
    openClose:function(item){
      item.active=!item.active;
    },
    open:function(file){
      if(GL.systemStop==false){
        if(filetab.$children[0].id!==false){
          filetab.$children[0].close();
        }
        //xxx
        filetab.$children[0].selected(file,'file');
      }else{
        GL.uyari(lang.msg.m50);
      }
      
      
    },
    setFiles:function(files){
      var arr = [];
      this.dataTypes.map(function(type){
        var extension = type.extension;
        var filter = files.filter(function(f){if(f.extension==extension){return true;}});
        type.num = filter.length;
        type.files=filter;
        arr.push(type);
      });
      this.dataTypes = arr;
    }
  },
  mounted(){

  },
  template:
  '<div class="ui relaxed divided list">'+

    '<div class="ui inverted segment" style="padding: 0;">'+
      '<div class="ui inverted accordion">'+

        '<div v-if="item.files.length>0" :key="i" v-for="(item,i) in dataTypes">'+
        '<div @click="openClose(item)" :class="item.active==true?\'title active unselect fontColor1\':\'title unselect fontColor1\'"> <i class="dropdown icon"></i> {{item.label}} - ({{item.num}})</div>'+
        '<div :class="item.active==true?\'content active\':\'content\'"> <p class="transition hidden">'+
          
        '<div class="ui list list1">'+
        '<div :key="j" v-for="(file,j) in item.files" class="item">'+
          ' <i class="file icon"></i>'+
          '<div class="content">'+
            '<a @click="open(file)" :title="lang.r.t12" class="listItem unselect fontColor1">{{file.name}}.{{file.extension}}</a>'+
          '</div>'+
        '</div>'+
        '</div>'+

        '</p> </div>'+
        '</div>'+

      '</div>'+
    '</div>'+

    
  '</div>'
  });

var filelist = new Vue({ el: '#filelist' });

