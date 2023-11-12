Vue.component('filetab', {
	data:function(){
		return {
      id:false,
      info:false,
      cls:{
        ptab:'item inverted',
        atab:'item inverted active',
        pcon:'ui bottom attached tab segment tabContent inverted',
        acon:'ui bottom attached tab segment tabContent inverted active',
      },
      bilgi:false,
      tileserver:false,
      style:false,
      caching:false,
      fileTabs:[
        {
          id:'bilgi',
          label:lang.l.t2,
          active:false,
          html:'<filebilgi></filebilgi>'
        },
        {
          id:'style',
          label:lang.l.t3,
          active:false,
          html:'<styling></styling>'
        },
        {
          id:'tileserver',
          label:lang.l.t4,
          active:false,
          html:'<filetileserver></filetileserver>'
        },
        {
          id:'caching',
          label:lang.l.t5,
          active:false,
          html:'<filecache></filecache>'
        }
      ]
    }
  },
  methods:{
    selected:function(obj,type){
      var that  =this;
      this.id = obj.id;
      this.info=obj;
      setTimeout(function(){
        that.fileTabs.map(function(tab){
          document.getElementById('gislayer-'+tab.id).innerHTML='<div id="gislayer-'+that.id+'-'+tab.id+'">'+tab.html+'</div>';
        });
        if(type=="file"){
          that.setActive({target:{dataset:{type:type}}},that.fileTabs[0]);
        }
      },10);
      
    },
    setActive:function(e,item){
      if(GL.systemStop==false){
        var that = this;
        if(this.bilgi!==false){
          if(this.bilgi.$children[0].status==false && item.id!=="bilgi"){
            GL.uyari(lang.msg.m2);
            return false;
          }
        }
        var type = e.target.dataset.type;
        if(type=="file"){
          this.fileTabs.map(function(f){
            f.active=false;
          });
        }
        item.active=true;
        setTimeout(function(){
          that.pageLoading(item);
        },10);
      }else{
        GL.uyari(lang.msg.m50);
      }
    },
    pageLoading:function(item){
      switch(item.id){
        case 'bilgi':{
          if(this.bilgi==false){
            this.bilgi = new Vue({ el: '#gislayer-'+this.id+'-'+item.id });
          }
          this.bilgi.$children[0].open(this.info);
          break;
        }
        case 'tileserver':{
          if(this.tileserver==false){
            this.tileserver = new Vue({ el: '#gislayer-'+this.id+'-'+item.id });
          }
          this.tileserver.$children[0].open(this.info);
          break;
        }
        case 'style':{
          if(this.style==false){
            this.style = new Vue({ el: '#gislayer-'+this.id+'-'+item.id });
          }
          this.style.$children[0].open(this.info);
          break;
        }
        case 'caching':{
          if(this.caching==false){
            this.caching = new Vue({ el: '#gislayer-'+this.id+'-'+item.id });
          }
          this.caching.$children[0].open(this.info);
          break;
        }
      }
    },
    close:function(){
      if(GL.systemStop==false){
        this.id=false;
        this.info=false;
        this.bilgi=false;
        this.tileserver=false;
        this.style=false;
      }else{
        GL.uyari(lang.msg.m50);
      }
    },
    save:function(){
      var filebilgi = this.bilgi.$children[0];
      var updateObj = {
        name:filebilgi.renameName,
        minzoom:filebilgi.zoomlevels.min,
        maxzoom:filebilgi.zoomlevels.max,
        tiletypes:{
          pbf:filebilgi.services.pbf,
          xyz:filebilgi.services.xyz,
          mvt:filebilgi.services.mvt,
          wfs:filebilgi.services.wfs,
          wms:filebilgi.services.wms,
          wmts:filebilgi.services.wmts
        },
        epsg:filebilgi.epsgInput,
        status:filebilgi.status==0?false:true
      }
      window.ipcRenderer.send('electron', {type:'file-update',data:{query:{id:this.id},data:updateObj}});
    }
  },
  mounted(){
    
  },
  template:
  '<div>'+
    '<div v-if="id==false" class="mainHelpText unselect" style="left: 50%; width: 100px; margin-left: -100px; margin-top: -120px; opacity: 0.8;">'+
      '<img :src="rootPath+\'/src/img/icons/gislayer-logo.png\'" style="width:100%;">'+
    '</div>'+
    '<div v-if="id==false" class="mainHelpText unselect">{{lang.l.t1}}</div>'+
    '<div v-if="id!==false">'+
    //dosyalar için başlangıç
      '<div class="ui pointing secondary menu inverted" style="margin-bottom: 0;">'+
        '<span class="spanFileName unselect">{{info.name}}.{{info.extension}} <a @click="close" :title="lang.g.close" class="closeFile unselect" href="#">x</a></span>'+
        '<a @click="setActive($event,item)" data-type="file" :key="i" v-for="(item,i) in fileTabs" :class="item.active==true?cls.atab:cls.ptab" :data-tab="item.id">{{item.label}}</a>'+
      '</div>'+
      '<div :key="i" v-for="(item,i) in fileTabs" :class="item.active==true?cls.acon:cls.pcon" :data-tab="item.id" style="margin-bottom: 0; border: none;">'+
        '<div :id="\'gislayer-\'+item.id" v-html="item.html"></div>'+
      '</div>'+
    //dosyalar için bitiş
    //servisler için

      '<div class="tabFooter">'+
        '<div class="ui buttons mini inverted">'+
        '<button @click="close" class="ui button">{{lang.g.cancel}}</button>'+
        '<div class="or"></div>'+
        '<button @click="save" class="ui blue button">{{lang.g.save}}</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
  });

var filetab = new Vue({ el: '#filetab' });

