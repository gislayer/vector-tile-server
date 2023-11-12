Vue.component('filebilgi', {
	data:function(){
		return {
      obj:false,
      renameName:'',
      epsgInput:'',
      epsgresult:[],
      zoomlevels:{min:0,max:22,data:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]},
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
    }
  },
  methods:{
    open:function(obj){
      window.ipcRenderer.send('electron', {type:'get-file',data:{id:obj.id}});
    },
    setFile:function(obj){
      this.obj=obj;
      var difobj =JSON.parse(JSON.stringify(this.obj)); 
      this.renameName = difobj.name;
      this.epsgInput = difobj.epsg;
      this.zoomlevels.min = difobj.minzoom;
      this.zoomlevels.max = difobj.maxzoom;
      this.services.pbf = difobj.tiletypes.pbf;
      this.services.xyz = difobj.tiletypes.xyz;
      this.services.mvt = difobj.tiletypes.mvt;
      this.services.wfs = difobj.tiletypes.wfs;
      this.services.wms = difobj.tiletypes.wms;
      this.services.wmts = difobj.tiletypes.wmts;
      this.status = difobj.status==0?false:true;
    },
    epsgSearch:function(){
      if(this.epsgInput.length>1){
        var result = [];
        for(var i in GL.EPSG){
          if(i.indexOf(this.epsgInput)!==-1){
            result.push(i);
          }
        }
        this.epsgresult=result;
      }
    },
    epsgSelect:function(item){
      this.epsgresult="";
      this.epsgInput=item;
    },
    zoomKontrol:function(minmax){
      if(this.zoomlevels.max<this.zoomlevels.min){
        if(minmax=="min"){
          this.zoomlevels.min = JSON.parse(JSON.stringify(this.obj)).minzoom;
        }else{
          this.zoomlevels.max = JSON.parse(JSON.stringify(this.obj)).maxzoom;
        }
        GL.uyari(lang.msg.m3);
        
      }
    },
    chageSwicth:function(type){
      this.services[type]=!this.services[type];
    },
    download:function(){
      window.ipcRenderer.send('electron', {type:'file-download',data:{id:this.obj.id}});
    },
    deletefile:function(){
      var that = this;
      yesno.$children[0].open({
        header:lang.msg.m4.title,
        content:lang.msg.m4.content},
        function(status){
        if(status){
          window.ipcRenderer.send('electron', {type:'file-delete',data:{id:that.obj.id}});
          filetab.$children[0].close();
        }
      })
    },
    deletefile2:function(obj){
      var that = this;
      yesno.$children[0].open({
        header:obj.header,
        content:obj.content},
        function(status){
        if(status){
          window.ipcRenderer.send('electron', {type:'file-delete',data:{id:that.obj.id}});
          filetab.$children[0].close();
        }
      })
    }
  },
  mounted(){

  },
  template:
  '<div class="ui inverted form">'+ 
    '<h2 class="ui dividing unselect header inverted">{{lang.l.t7}}</h2>'+

    '<div class="field">'+
      '<label class="unselect">{{lang.l.t8}}</label>'+
      '<div class="ui checkbox toggle">'+
        '<input v-model="status" type="checkbox" name="public">'+
        '<label class="unselect" :style="status==true?active:passive" >{{status==true?lang.g.active:lang.g.passive}}</label>'+
      '</div>'+
    '</div>'+

    '<div class="field inverted">'+
      '<label class="unselect">{{lang.l.t9}}</label>'+
      '<div class="ui right labeled input inverted mini">'+
        '<input :disabled="!status" class="input1" v-model="renameName" type="text" :placeholder="lang.l.t9">'+
        '<div class="ui basic label unselect" style="background-color: #d0d0d0;">.{{obj.extension}}</div>'+
      '</div>'+
    '</div>'+

    '<div class="field inverted">'+
      '<label class="unselect">{{lang.l.t10}}</label>'+
      '<div class="ui search mini">'+
        '<div class="ui icon input">'+
          '<input :disabled="!status" @keyup="epsgSearch" v-model="epsgInput" class="prompt input1" type="text" :placeholder="lang.l.t16">'+
          '<i class="search icon"></i>'+
        '</div>'+
        '<div :class="epsgresult.length==0?\'results transition hidden search1\':\'results transition visible search1\'">'+
          '<div @click="epsgSelect(item)" :key="a" v-for="(item,a) in epsgresult" class="result">'+
            '<div class="content">'+
              '<div class="title" style="color: #c3c3c3; font-weight: normal;">{{item}}'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="field inverted">'+
      '<label class="unselect">{{lang.l.t11}}</label>'+
      '<div class="ui fluid inverted">'+
        '<select :disabled="!status" @change="zoomKontrol(\'min\')" class="input1" style="outline: none;" v-model="zoomlevels.min"><option :key="i" v-for="(l,i) in zoomlevels.data" :value="l">{{l}}</opiton></select>'+
      '</div>'+
    '</div>'+

    '<div class="field inverted">'+
      '<label class="unselect">{{lang.l.t12}}</label>'+
      '<div class="ui fluid inverted">'+
        '<select :disabled="!status" @change="zoomKontrol(\'max\')" class="input1" style="outline: none;" v-model="zoomlevels.max"><option :key="i" v-for="(l,i) in zoomlevels.data" :value="l">{{l}}</opiton></select>'+
      '</div>'+
    '</div>'+

    '<h2 class="ui unselect dividing header inverted">{{lang.l.t13}}</h2>'+
    '<div :key="j" v-for="(a,j) in serviceTypes" class="field">'+
      '<label class="unselect">{{a.toUpperCase()}} {{lang.l.t14}}</label>'+
      '<div class="ui checkbox toggle">'+
        '<input :disabled="!status" v-model="services[a]" type="checkbox" name="public">'+
        '<label class="unselect" :style="services[a]==true?active:passive" >{{services[a]==true?lang.g.active:lang.g.passive}}</label>'+
      '</div>'+
    '</div>'+

    '<h2 class="ui unselect dividing header inverted">{{lang.l.t15}}</h2>'+
    '<div class="field">'+
      '<button @click="download" class="ui inverted olive basic button">{{lang.g.downfile}}</button>'+
      '<button @click="deletefile" class="ui inverted red basic button">{{lang.g.deletefile}}</button>'+
    '</div>'+

  '</div>'
  });

