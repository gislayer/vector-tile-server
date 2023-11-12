Vue.component('filetileserver', {
	data:function(){
		return {
      obj:false,
      tiletypes:[
        //{type:"wfs",active:false,runnig:false,name:"WFS "+lang.g.server,url:"",slug:"",slugText:"WFS "+lang.g.server},
        //{type:"wms",active:false,runnig:false,name:"WMS "+lang.g.server,url:"",slug:"",slugText:"WMS "+lang.g.server},
        //{type:"wmts",active:false,runnig:false,name:"WMTS Tile "+lang.g.server,url:"",slug:"",slugText:"WMTS Tile "+lang.g.server},
        //{type:"mvt",active:false,runnig:false,name:"MVT Tile "+lang.g.server,url:"",slug:"",slugText:"MVT Tile "+lang.g.server},
        {type:"pbf",active:false,runnig:false,name:"PBF Tile "+lang.g.server,url:"",slug:"",slugText:"PBF Tile "+lang.g.server},
        {type:"xyz",active:false,runnig:false,name:"XYZ Tile "+lang.g.server,url:"",slug:"",slugText:"XYZ Tile "+lang.g.server},
      ]
    }
    
  },
  methods:{
    open:function(obj){
      debugger;
      window.ipcRenderer.send('electron', {type:'get-file',data:{id:obj.id}});
      window.ipcRenderer.send('electron', {type:'get-tiles',data:{file_id:obj.id}});
      this.tiletypes.map(function(a){
        var slug = GL.getSlug(a.name);
        var url = 'http://localhost:1881/gislayer/'+slug+'/'+a.type;
        a.url = url;
        a.slugText = obj.name;
        a.globalURL = 'http://localhost:1881/gislayer/'+a.type;
      });
      this.checkSlugs();
    },
    setFile:function(data){
      this.obj = data;
    },
    setCurrentTiles:function(tiles){
      var that = this;
      tiles.data.map(function(tile){
        var type = tile.type;
        that.tiletypes.map(function(a){
          if(type==a.type){
            a.active=true;
            a.runnig = tile.status;
            a.slugText = tile.name;
            a.slug=tile.slug;
          }
        });
      });
      this.checkSlugs();
    },
    copyText:function(item){
      var text = item.url;
      window.ipcRenderer.send('electron', {type:'copytext',data:{text:text}});
    },
    copyText2:function(item){
      var text = item.globalURL;
      window.ipcRenderer.send('electron', {type:'copytext',data:{text:text}});
    },
    checkSlugs:function(){
      var that = this;
      this.tiletypes.map(function(item){
        that.addSlug(item);
      });
    },
    addSlug:function(item){
      var slugText = item.slugText;
      slugText = GL.getSlug(slugText);
      var slugName = slugText;
      if(["mvt","pbf","xyz"].indexOf(item.type)!==-1){
        var type = item.type;
        if(type=="xyz"){
          type="png";
        }
        slugText = '/{z}/{x}/{y}.'+type;
        item.url = 'http://localhost:1881/gislayer/'+item.type+'/'+slugName+'/'+this.obj.id+slugText
      }else{
        item.url = 'http://localhost:1881/gislayer/'+slugText+'/'+this.obj.id+'/'+item.type
      }
      
      item.slug = slugText;
    },
    save:function(item){
      debugger;
    var insertObj = {
      name:item.slugText,
      slug:item.slug,
      file_id:this.obj.id,
      type:item.type,
      url:item.url,
      settings:{}
    };
    window.ipcRenderer.send('electron', {type:'save-tile-server',data:insertObj});
    },
    update:function(item){
      var that = this;
      yesno.$children[0].open({
        header:item.type.toUpperCase()+' '+lang.msg.m7.title,
        content:item.slugText+' - '+item.type+', '+lang.msg.m7.content,
        icon:'stop pencil outline'},
        function(status){
        if(status){
          var updateObj = {
            name:item.slugText,
            slug:item.slug,
            file_id:that.obj.id,
            type:item.type,
            url:item.url,
            settings:{}
          };
          window.ipcRenderer.send('electron', {type:'update-tile-server',data:updateObj});
        }
      })
      
    },
    publish:function(item){
      var that = this;
      yesno.$children[0].open({
        header:item.type.toUpperCase()+' '+lang.msg.m5.title,
        content:item.slugText+' - '+item.type+', '+lang.msg.m5.content,
        icon:'servicestack'},
        function(status){
        if(status){
          var obj = {
            file_id:that.obj.id,
            type:item.type,
          };
          window.ipcRenderer.send('electron', {type:'active-tile-service',data:obj});
        }
      })
    },
    stop:function(item){
      //
      var that = this;
      yesno.$children[0].open({
        header:item.type.toUpperCase()+' '+lang.msg.m6.title,
        content:item.slugText+' - '+item.type+', '+lang.msg.m6.content,
        icon:'stop circle outline'},
        function(status){
        if(status){
          var obj = {
            file_id:that.obj.id,
            type:item.type,
          };
          window.ipcRenderer.send('electron', {type:'stop-tile-service',data:obj});
        }
      })
    }
  },
  mounted(){

  },
  template:
  '<div v-if="obj!==false" class="ui inverted form">'+ 
    '<div v-if="obj.tiletypes[item.type]==true" :key="i" v-for="(item,i) in tiletypes">'+

      '<div class="ui inverted form" style="margin-bottom: 100px;">'+
        '<h3 class="ui dividing unselect header inverted" style="color: #2185d0;">{{item.name}} <span v-if="item.active==true && item.runnig==true" style="color:#8bc34a; font-size: 11px; font-weight: normal;"> - Bu Servis Şu Anda Yayında</span></h3>'+

        '<div v-if="[\'wfs\',\'wms\',\'wmts\']" class="field inverted">'+
          '<label class="unselect">{{lang.l.t17}}</label>'+
          '<div class="ui input inverted mini">'+
            '<input :disabled="item.active==true && item.runnig==true"s @keyup="addSlug(item)" class="input1" v-model="item.slugText" type="text" :placeholder="lang.l.t17">'+
          '</div>'+
        '</div>'+

        '<div class="field inverted">'+
          '<label class="unselect">{{lang.l.t18}}</label>'+
          '<div class="ui labeled right input inverted mini">'+
            '<input disabled class="input1" v-model="item.url" type="text" :placeholder="lang.l.t18">'+
            '<a @click="copyText(item)" class="ui tag label unselect">{{lang.g.copy}}</a>'+
          '</div>'+
        '</div>'+

        '<div v-if="[\'wfs\',\'wms\',\'wmts\'].indexOf(item.type)!==-1" class="field inverted">'+
          '<label class="unselect">{{item.type.toUpperCase()}} {{lang.l.t19}}</label>'+
          '<div class="ui labeled right input inverted mini">'+
            '<input disabled class="input1" v-model="item.globalURL" type="text" :placeholder="lang.l.t19">'+
            '<a @click="copyText2(item)" class="ui tag label unselect">{{lang.g.copy}}</a>'+
          '</div>'+
        '</div>'+

        '<div class="field inverted">'+
          '<button @click="update(item)" v-if="item.active==true && item.runnig==false" class="ui mini inverted green button">{{lang.g.saveupdates}}</button>'+
          '<button @click="save(item)" v-if="item.active==false" class="ui mini green button">{{lang.g.save}}</button>'+
          '<button @click="stop(item)" v-if="item.active==true && item.runnig==true" class="ui mini red button">{{lang.g.stopservice}}</button>'+
          '<button @click="publish(item)" v-if="item.active==true && item.runnig==false" class="ui mini green button">{{lang.g.startservice}}</button>'+
        '</div>'+

      '</div>'+

    '</div>'+

  '</div>'
  });