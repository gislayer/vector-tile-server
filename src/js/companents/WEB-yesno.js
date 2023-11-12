Vue.component('yesno', {
	data:function(){
		return {
      header:'',
      content:'',
      status:false,
      icon:'',
      cls:{
        a1:"ui dimmer modals page transition visible active",
        p1:"ui dimmer modals page transition",
        a2:"ui small basic test modal transition visible active",
        p2:"ui small basic test modal transition",
        a3:{display:'flex !important'},
        p3:{display:'none'},
      },
      callback:null
    }
  },
  methods:{
    open:function(obj,callback){
      this.status=true;
      if(obj.icon==undefined){
        this.icon = 'trash alternate outline icon';
      }else{
        this.icon = obj.icon+' icon';
      }
      this.header=obj.header;
      this.content=obj.content;
      this.callback = callback;
    },
    clear:function(){
      this.status=false;
      this.header='';
      this.content='';
    },
    close:function(){
      if(this.callback!==null){
        this.callback(false);
      }
      this.clear();
      this.callback=null;
    },
    yes:function(){
      if(this.callback!==null){
        this.callback(true);
      }
      this.clear();
      this.callback=null;
    }
  },
  mounted(){

  },
  template:
  '<div'+ 
    '<div :class="status==true?cls.a1:cls.p1" :style="status==true?cls.a3:cls.p3">'+
      '<div :class="status==true?cls.a2:cls.p2">'+
        '<div class="ui icon header">'+
          '<i style="color: #ccc;" :class="icon"></i>'+
          '<span style="color: #ccc;">{{header}}</span>'+
        '</div>'+
        '<div class="content">'+
          '<p style="color: #ccc;" v-html="content" style="text-align: center;"></p>'+
        '</div>'+
        '<div class="actions">'+
          '<div @click="close" class="ui green ok inverted button">'+
            '<i class="remove icon"></i>'+
            '{{lang.g.no}}'+
          '</div>'+
          '<div @click="yes" class="ui red basic cancel inverted button">'+
            '<i class="checkmark icon"></i>'+
            '{{lang.g.yes}}'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
  });

var yesno = new Vue({ el: '#yesno' });

