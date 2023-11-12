Vue.component('servicelist', {
	data:function(){
		return {
      dataTypes:[
        {
          label:'GeoJSON Dosyaları',
          icon:'',
          active:false,
          num:1,
          extension:'geojson',
          files:[]
        },
        {
          label:'KML Dosyaları',
          icon:'',
          active:false,
          num:1,
          extension:'kml',
          files:[]
        }
      ]
    }
  },
  methods:{
    openClose:function(item){
      item.active=!item.active;
    }
  },
  mounted(){
    var that = this;
    /*.readAll().then(files => {
      that.dataTypes.map(function(type){
        var extension = type.extension;
        var filter = files.filter(function(f){if(f.extension==extension){return true;}});
        type.num = filter.length;
        type.files=filter;
      });
    })*/
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
            '<a class="listItem unselect fontColor1">{{file.name}}</a>'+
          '</div>'+
        '</div>'+
        '</div>'+

        '</p> </div>'+
        '</div>'+

      '</div>'+
    '</div>'+

    
  '</div>'
  });

var servicelist = new Vue({ el: '#servicelist' });

