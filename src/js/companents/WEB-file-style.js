Vue.component('styling', {
  data: function () {
    return {
      geotypes: {
        selected: '',
        data: [{
            value: 'Point',
            text: lang.g.point
          },
          {
            value: 'LineString',
            text: lang.g.linestring
          },
          {
            value: 'Polygon',
            text: lang.g.polygon
          },
        ]
      },
      proptaraf:{},
      active: {
        color: "#8bc34a !important"
      },
      passive: {
        color: "#808080 !important"
      },
      styles: {
        selected: 0,
        data: []
      },
      map: false,
      obj: {},
      layer: false,
      url: false,
      createnew: false,
      updatenew:false,
      newstylename: '',
      isGlobal: true,
      editPointNum:-1,
      editStyleId:-1,
      fields:{selected:'',data:[]},
      bbox:[-180,-90,180,90],
      style: {
        point: [],
        linestring: [],
        polygon: [],
        label: []
      },
      table: {
        point: [],
        linestring: [],
        polygon: [],
        label: []
      },
      lineJoin:{
        selected:'round',
        data:[
          {value:'miter',text:lang.l.t50},
          {value:'round',text:lang.l.t51},
          {value:'bevel',text:lang.l.t52},
        ]
      },
      lineCap:{
        selected:'round',
        data:[
          {value:'butt',text:lang.l.t56},
          {value:'round',text:lang.l.t57},
          {value:'square',text:lang.l.t58},
        ]
      },
      point: {
        "min": 0,
        "max": 22,
        "filters": [],
        "fillColor": "#ff0000",
        "fillOpacity": 1,
        "strokeColor": "#000000",
        "strokeOpacity": 1,
        "lineWidth": 1,
        "lineCap": "round",
        "lineJoin": "round",
        "lineDash": "",
        "radius": 3
      },
      pointdefault: {
        "min": 0,
        "max": 22,
        "filters": [],
        "fillColor": "#ff0000",
        "fillOpacity": 1,
        "strokeColor": "#000000",
        "strokeOpacity": 1,
        "lineWidth": 1,
        "lineCap": "round",
        "lineJoin": "round",
        "lineDash": "",
        "radius": 3
      },
      polygon: {
        "min": 0,
        "max": 22,
        "filters": [],
        "fillColor": "#ff0000",
        "fillOpacity": 1,
        "strokeColor": "#000000",
        "strokeOpacity": 1,
        "lineWidth": 1,
        "lineCap": "round",
        "lineJoin": "round",
        "lineDash": ""
      },
      polygondefault: {
        "min": 0,
        "max": 22,
        "filters": [],
        "fillColor": "#ff0000",
        "fillOpacity": 1,
        "strokeColor": "#000000",
        "strokeOpacity": 1,
        "lineWidth": 1,
        "lineCap": "round",
        "lineJoin": "round",
        "lineDash": ""
      },
      linestring:{
        "min":0,
        "max":22,
        "filters":[],
        "strokeColor":"#FF0000",
        "strokeOpacity": 1,
        "lineWidth":3,
        "lineCap":"butt",
        "lineJoin":"miter",
        "lineDash": ""
      },
      linestringdefault:{
        "min":0,
        "max":22,
        "filters":[],
        "strokeColor":"#FF0000",
        "strokeOpacity": 1,
        "lineWidth":3,
        "lineCap":"butt",
        "lineJoin":"miter",
        "lineDash": ""
      },
      workingn:{
        type:'',
        i:-1
      }

    }
  },
  methods: {
    open(obj) {
      //window.ipcRenderer.send('electron', {type:'get-style',data:{id:obj.id}});
      debugger;
      var that = this;
      this.obj = obj;
      this.fields.data = JSON.parse(obj.fields);
      this.bbox = JSON.parse(obj.bbox);
      var style_id = obj.style;
      var file_id = obj.id;
      var styles = [];
      for (var i in GL.styles) {
        var style = GL.styles[i];
        if (style.file_id == 0 || style.file_id == file_id) {
          styles.push(style);
        }
      }
      this.styles.data = styles;
      this.styles.selected = style_id;
      document.getElementById('testmap').innerHTML='';
      this.genislet();
      setTimeout(function () {
        that.url = "http://localhost:1881" + '/testserver/' + that.obj.id + '/{z}/{x}/{y}.png';
        var scaleControl = new ol.control.ScaleLine();
        that.map = new ol.Map({
          target: 'testmap',
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM()
            })
          ],
          view: new ol.View({
            center: [1393473, 1218573],
            zoom: 1.6546360285
          }),
          controls: ol.control.defaults({
            attributionOptions: {
              collapsible: false
            }
          }).extend([scaleControl])
        });
        that.map.getControls().forEach(function (control) {
          that.map.removeControl(control);
        }, this);

        that.layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: that.url
          })
        });
        debugger;
        that.map.addLayer(that.layer);
        var c1 = ol.proj.transform([that.bbox[0], that.bbox[1]], 'EPSG:4326', 'EPSG:3857');
        var c2 = ol.proj.transform([that.bbox[2], that.bbox[3]], 'EPSG:4326', 'EPSG:3857');
        that.map.getView().fit([c1[0],c1[1],c2[0],c2[1]], that.map.getSize());  
        that.anlikGoster();     
      }, 10);
    },
    genislet(){
      var sagtaraf = document.getElementById('sagtaraf');
      this.proptaraf.height = (sagtaraf.clientHeight-100)+'px';
      this.proptaraf.overflowY = 'scroll';
      this.proptaraf.overflowX = 'hidden';
    },
    updateSendStyle() {
      window.ipcRenderer.send('electron', {
        type: 'change-test-style',
        data: {
          fileid: this.obj.id,
          styleid: this.styles.selected
        }
      });
    },
    updateTile() {
      var newURL = this.url + '?time=' + Date.now()
      this.layer.getSource().setUrl(newURL);
    },
    startNewDesign() {
      this.createnew = true;
      this.geotypes.selected='';
    },
    geoTypeSelected() {
      var selectedType = this.geotypes.selected;
      if(selectedType=="Point"){
        this.workingn = {type:'point',i:this.style.point.length};
        this.point = JSON.parse(JSON.stringify(this.pointdefault));
        this.setProps('point');
      }
      if(selectedType=="LineString"){
        this.workingn = {type:'linestring',i:this.style.linestring.length};
        this.linestring = JSON.parse(JSON.stringify(this.linestringdefault));
        this.setProps('linestring');
      }
      if(selectedType=="Polygon"){
        this.workingn = {type:'polygon',i:this.style.polygon.length};
        this.polygon = JSON.parse(JSON.stringify(this.polygondefault));
        this.setProps('polygon');
      }
    },
    colorPalette(type) {
      var that = this;
      var color = document.createElement('input');
      color.type = "color";
      color.value = this.point.fillColor;
      color.click();
      color.addEventListener('change', function (element) {
        that.setColor(type, element.target.value);
      }, false);
    },
    setColor(type, value) {
      switch (type) {
        case 'linestring.strokeColor': {
          this.linestring.strokeColor = value;
          this.setProps('linestring');
          break;
        }
        case 'point.fillColor': {
          this.point.fillColor = value;
          this.setProps('point');
          break;
        }
        case 'point.strokeColor': {
          this.point.strokeColor = value;
          this.setProps('point');
          break;
        }
        case 'polygon.fillColor': {
          this.polygon.fillColor = value;
          this.setProps('polygon');
          break;
        }
        case 'polygon.strokeColor': {
          this.polygon.strokeColor = value;
          this.setProps('polygon');
          break;
        }
      }
    },
    setProps(type) {
      if(type=="linestring"){
        var linestring = {
          min: 0,
          max: 22,
          filters: [],
          strokeStyle: "rgba(255,0,0,1)",
          lineWidth: 2,
          lineCap: "round",
          lineJoin: "round"
        };
        linestring.lineJoin = this.lineJoin.selected;
        linestring.lineCap = this.lineCap.selected;
        if(this.linestring.lineDash!==""){
          var arr = this.linestring.lineDash.split(',');
          var arr2 = [];
          arr.map(function(a){
            if(a!==""){
              a = parseInt(a,10);
            }else{
              a=0;
            }
            arr2.push(a);
          });
          linestring.lineDash = arr2
        }
        linestring.strokeStyle = GL.hexToRGBA(this.linestring.strokeColor,parseFloat(this.linestring.strokeOpacity));
        if(linestring.strokeStyle==undefined){
          linestring.strokeStyle='rgba(0,0,0,1)'
        }

        linestring.lineWidth = parseFloat(this.linestring.lineWidth);
        linestring.min = parseInt(this.linestring.min,10);
        linestring.max = parseInt(this.linestring.max,10);
        this.style.linestring[this.workingn.i] = linestring;
        this.table.linestring[this.workingn.i] = this.linestring;

        window.ipcRenderer.send('electron', {
          type: 'change-currenttest-style',
          data: {
            fileid: this.obj.id,
            style: this.style
          }
        });
        return linestring;
      }

      if(type=="polygon"){
        var polygon = {
          min: 0,
          max: 22,
          filters: [],
          fillStyle: "",
          strokeStyle: "rgba(255,0,0,1)",
          lineWidth: 2,
          lineCap: "round",
          lineJoin: "round"
        };
        polygon.lineJoin = this.lineJoin.selected;
        polygon.lineCap = this.lineCap.selected;
        if(this.polygon.lineDash!==""){
          var arr = this.polygon.lineDash.split(',');
          var arr2 = [];
          arr.map(function(a){
            if(a!==""){
              a = parseInt(a,10);
            }else{
              a=0;
            }
            arr2.push(a);
          });
          polygon.lineDash = arr2
        }
        polygon.fillStyle = GL.hexToRGBA(this.polygon.fillColor,parseFloat(this.polygon.fillOpacity));
        if(polygon.fillStyle==undefined){
          polygon.fillStyle='rgba(0,0,0,1)'
        }

        polygon.strokeStyle = GL.hexToRGBA(this.polygon.strokeColor,parseFloat(this.polygon.strokeOpacity));
        if(polygon.strokeStyle==undefined){
          polygon.strokeStyle='rgba(0,0,0,1)'
        }

        polygon.lineWidth = parseFloat(this.polygon.lineWidth);
        polygon.min = parseInt(this.polygon.min,10);
        polygon.max = parseInt(this.polygon.max,10);
        this.style.polygon[this.workingn.i] = polygon;
        this.table.polygon[this.workingn.i] = this.polygon;

        window.ipcRenderer.send('electron', {
          type: 'change-currenttest-style',
          data: {
            fileid: this.obj.id,
            style: this.style
          }
        });
        return polygon;
      }
      

      if(type=="point"){
        var point = {
          min: 0,
          max: 22,
          filters: [],
          fillStyle: "",
          strokeStyle: "rgba(255,0,0,1)",
          lineWidth: 2,
          lineCap: "round",
          lineJoin: "round",
          radius: 6
        };

        if(this.point.lineDash!==""){
          var arr = this.point.lineDash.split(',');
          var arr2 = [];
          arr.map(function(a){
            if(a!==""){
              a = parseInt(a,10);
            }else{
              a=0;
            }
            arr2.push(a);
          });
          point.lineDash = arr2
        }

        point.fillStyle = GL.hexToRGBA(this.point.fillColor,parseFloat(this.point.fillOpacity));
        if(point.fillStyle==undefined){
          point.fillStyle='rgba(0,0,0,1)'
        }

        point.strokeStyle = GL.hexToRGBA(this.point.strokeColor,parseFloat(this.point.strokeOpacity));
        if(point.strokeStyle==undefined){
          point.strokeStyle='rgba(0,0,0,1)'
        }

        point.radius = parseInt(this.point.radius,10);
        point.lineWidth = parseFloat(this.point.lineWidth);
        point.min = parseInt(this.point.min,10);
        point.max = parseInt(this.point.max,10);
        this.style.point[this.workingn.i] = point;
        this.table.point[this.workingn.i] = this.point;
        
        window.ipcRenderer.send('electron', {
          type: 'change-currenttest-style',
          data: {
            fileid: this.obj.id,
            style: this.style
          }
        });
        return point;
      }
      
    },
    addPoint(){
      this.geotypes.selected='';
      this.workingn = {type:'',i:-1};
      this.point = JSON.parse(JSON.stringify(this.pointdefault));
      this.genislet();
    },
    addPolygon(){
      this.geotypes.selected='';
      this.workingn = {type:'',i:-1};
      this.polygon = JSON.parse(JSON.stringify(this.polygondefault));
      this.genislet();
    },
    addLineString(){
      this.geotypes.selected='';
      this.workingn = {type:'',i:-1};
      this.linestring = JSON.parse(JSON.stringify(this.linestringdefault));
      this.genislet();
    },
    editPoint(i){
      this.geotypes.selected='Point';
      this.workingn = {type:'point',i:i};
      this.point = this.table.point[i];
      this.editPointNum=i;
    },
    editPolygon(i){
      this.geotypes.selected='Polygon';
      this.workingn = {type:'polygon',i:i};
      this.polygon = this.table.polygon[i];
      this.editPointNum=i;
    },
    editLineString(i){
      this.geotypes.selected='LineString';
      this.workingn = {type:'linestring',i:i};
      this.linestring = this.table.linestring[i];
      this.editPointNum=i;
    },
    deletePoint(i){
      var that = this;
      yesno.$children[0].open({
        header:lang.msg.m36.title,
        content:lang.msg.m36.content},
        function(status){
        if(status){
          that.style.point.splice(i,1);
          that.table.point.splice(i,1);
          window.ipcRenderer.send('electron', {
            type: 'change-currenttest-style',
            data: {
              fileid: that.obj.id,
              style: that.style
            }
          });
        }
      })
      this.genislet();
    },
    deletePolygon(i){
      var that = this;
      yesno.$children[0].open({
        header:lang.msg.m36.title,
        content:lang.msg.m36.content},
        function(status){
        if(status){
          that.style.polygon.splice(i,1);
          that.table.polygon.splice(i,1);
          window.ipcRenderer.send('electron', {
            type: 'change-currenttest-style',
            data: {
              fileid: that.obj.id,
              style: that.style
            }
          });
        }
      })
      this.genislet();
    },
    deleteLineString(i){
      var that = this;
      yesno.$children[0].open({
        header:lang.msg.m36.title,
        content:lang.msg.m36.content},
        function(status){
        if(status){
          that.style.linestring.splice(i,1);
          that.table.linestring.splice(i,1);
          window.ipcRenderer.send('electron', {
            type: 'change-currenttest-style',
            data: {
              fileid: that.obj.id,
              style: that.style
            }
          });
        }
      })
      this.genislet();
    },
    saveStyle(){
      debugger;
      if(this.newstylename!==""){
        var insertObj = {
          fileid:this.obj.id,
          file_id:0,
          name:this.newstylename,
          label:"[]",
          point:"[]",
          linestring:"[]",
          polygon:"[]",
          status:1
        }
        if(this.isGlobal==false){
          insertObj.file_id = this.obj.id;
        }
        if(this.style.point.length>0){
          insertObj.point = JSON.stringify(this.style.point);
        }
        if(this.style.linestring.length>0){
          insertObj.linestring = JSON.stringify(this.style.linestring);
        }
        if(this.style.polygon.length>0){
          insertObj.polygon = JSON.stringify(this.style.polygon);
        }
        window.ipcRenderer.send('electron', {
          type: 'add-style',
          data: {
            insert: insertObj
          }
        });
        this.cancel('insert');
      }else{
        GL.uyari(lang.msg.m37)
      }
    },
    editStyle(){
      debugger;
      var style = GL.styles[this.styles.selected];
      var points = style.point;
      var linestrings = style.linestring;
      var polygons = style.polygon;
      var labels = style.label;
      this.editStyleId = style.id;
      this.geotypes.selected='';
      var forPointTable = [];
      var forLinestringTable=[];
      var forPolygonTable=[];
      points.map(function(p){
        forPointTable.push({
          "min": p.min,
          "max": p.max,
          "filters": p.filters,
          "fillColor": GL.rgbaToHex(p.fillStyle).color,
          "fillOpacity": GL.rgbaToHex(p.fillStyle).opacity,
          "strokeColor": GL.rgbaToHex(p.strokeStyle).color,
          "strokeOpacity": GL.rgbaToHex(p.strokeStyle).opacity,
          "lineWidth": p.lineWidth,
          "lineCap": p.lineCap,
          "lineJoin": p.lineJoin,
          "lineDash": p.lineDash,
          "radius": p.radius
        });
      });
      this.table.point = forPointTable;

      linestrings.map(function(p){
        forLinestringTable.push({
          "min": p.min,
          "max": p.max,
          "filters": p.filters,
          "strokeColor": GL.rgbaToHex(p.strokeStyle).color,
          "strokeOpacity": GL.rgbaToHex(p.strokeStyle).opacity,
          "lineWidth": p.lineWidth,
          "lineCap": p.lineCap,
          "lineJoin": p.lineJoin,
          "lineDash": p.lineDash
        });
      });
      this.table.linestring = forLinestringTable;

      polygons.map(function(p){
        forPolygonTable.push({
          "min": p.min,
          "max": p.max,
          "filters": p.filters,
          "fillColor": GL.rgbaToHex(p.fillStyle).color,
          "fillOpacity": GL.rgbaToHex(p.fillStyle).opacity,
          "strokeColor": GL.rgbaToHex(p.strokeStyle).color,
          "strokeOpacity": GL.rgbaToHex(p.strokeStyle).opacity,
          "lineWidth": p.lineWidth,
          "lineCap": p.lineCap,
          "lineJoin": p.lineJoin,
          "lineDash": p.lineDash
        });
      });
      this.table.polygon = forPolygonTable;
      this.style.point = points;
      this.style.linestring = linestrings;
      this.style.polygon = polygons;
      this.style.label = labels;
      var workok=false;

      if(points.length>0 && workok==false){
        workok=true;
      }
      if(linestrings.length>0 && workok==false){
        workok=true;
      }
      if(polygons.length>0 && workok==false){
        workok=true;
      }
      this.updatenew = workok;
    },
    updateStyle(){},
    cancel(status){
      debugger;
      this.createnew = false;
      this.updatenew = false;
      this.newstylename = '';
      isGlobal = true;
      editPointNum = -1;
      editStyleId = -1;
      this.style = {
        point: [],
        linestring: [],
        polygon: [],
        label: []
      };
      this.table = {
        point: [],
        linestring: [],
        polygon: [],
        label: []
      };
      this.workingn = {type:'',i:-1};
      this.geotypes.selected='';
      this.point = this.pointdefault;
      this.linestring = this.linestringdefault;
      this.polygon = this.polygondefault;
      var obj = this.obj;
      if(status=='canceling'){
        var style_id = obj.style;
        var file_id = obj.id;
        var styles = [];
        for (var i in GL.styles) {
          var style = GL.styles[i];
          if (style.file_id == 0 || style.file_id == file_id) {
            styles.push(style);
          }
        }
        this.styles.data = styles;
        this.styles.selected = style_id;
        this.anlikGoster();
      }
      
     
    },
    anlikGoster(){
      var id = this.styles.selected;
      this.obj.style = id;
      filetab.$children[0].obj = this.obj.style;
      var style = GL.styles[id];
      window.ipcRenderer.send('electron', {
        type: 'change-currenttest-style',
        data: {
          fileid: this.obj.id,
          style: style
        }
      });
    }
  },
  mounted() {

  },
  template: '<div>' +
    '<div class="ui two column stackable grid">' +

    //sol taraf
    '<div class="six wide column" id="proptaraf" :style="proptaraf">' +
      '<div class="ui form inverted">' +

        //başlık
        '<h2 class="ui dividing unselect header inverted">{{lang.l.t21}}</h2>' +

        //Kayıtlı Stiller
        '<div class="field inverted">' +
          '<label class="unselect">{{lang.l.t20}}</label>' +
          '<select @change="anlikGoster" :disabled="createnew || styles.data.length==0" v-model="styles.selected" style="outline: none;" class="input1"><option v-for="(item,i) in styles.data" :value="item.id">{{item.name}}</option></select>' +
        '</div>' +

        //stil oluşturma buton grubu
        '<div class="ui inverted tiny right floated buttons">' +
          '<button :disabled="createnew || styles.data.length==0" @click="editStyle" class="ui orange button">{{lang.g.edit}}</button>' +
            '<div class="or"></div>' +
          '<button  :disabled="createnew || styles.data.length==0" @click="updateSendStyle" class="ui teal button">{{lang.g.use}}</button>' +
            '<div class="or"></div>' +
          '<button :disabled="createnew" @click="startNewDesign" class="ui green button">{{lang.g.createnew}}</button>' +
        '</div>' +

        //yeni stil oluşturma
        '<div v-if="createnew || updatenew" style="margin-top: 60px;"><hr>' +

          '<h3 class="ui dividing unselect header inverted">{{lang.l.t60}}</h3>' +

          //geometri tipleri
          '<div class="field inverted" style="margin-top: 20px; margin-bottom:20px;">' +
            '<label class="unselect">{{lang.g.geometrytype}}</label>' +
            '<div class="ui fluid inverted">' +
              '<select @change="geoTypeSelected()" class="input1" style="outline: none;" v-model="geotypes.selected"><option :key="i" v-for="(l,i) in geotypes.data" :value="l.value">{{l.text}}</opiton></select>' +
            '</div>' +
          '</div>' +

          //nokta stillendirmesi başlangıcı
          '<div v-if="workingn.type==\'point\'">' +

            //min-max - nokta
            '<h3 class="ui dividing unselect header inverted">{{lang.l.t28}}</h3>' +
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t27}} - {{lang.g.min}} : {{point.min}} | {{lang.g.max}} : {{point.max}}</label>' +
              '<span class="multi-range"> <input style="width:435px;" @change="setProps(\'point\')" v-model="point.min" type="range" min="0" max="22" value="0" id="lower"> <input @change="setProps(\'point\')" style="width:435px;" v-model="point.max" type="range" min="0" max="22" value="22" id="upper"> </span>' +
            '</div>' +

            //fillColor - nokta
            '<div class="field inverted" style="margin-top: 50px;">' +
              '<label class="unselect">{{lang.l.t31}}</label>' +
              '<div class="ui icon input inverted">' +
                '<input @input="setProps(\'point\')" type="text" class="input1" v-model="point.fillColor" :style="{color:point.fillColor+ \'!important\',textShadow:\'1px 1px #000 !important\'}">' +
                '<i @click="colorPalette(\'point.fillColor\')" class="inverted circular eye dropper link icon"></i>' +
              '</div>' +
            '</div>' +

            //fillOpacity - nokta
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t34}} : {{parseInt(point.fillOpacity*100)}}%</label>' +
              '<span class="range"> <input @change="setProps(\'point\')" v-model="point.fillOpacity" type="range" min="0" step="0.01" max="1" value="1" id="lower"></span>' +
            '</div>' +

            //strokeColor - nokta
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t32}}</label>' +
              '<div class="ui icon input inverted">' +
                '<input @input="setProps(\'point\')" type="text" class="input1" v-model="point.strokeColor" :style="{color:point.strokeColor+ \'!important\',textShadow:\'1px 1px #000 !important\'}">' +
                '<i @click="colorPalette(\'point.strokeColor\')" class="inverted circular eye dropper link icon"></i>' +
              '</div>' +
            '</div>' +

            //strokeOpacity - nokta
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t35}} : {{parseInt(point.strokeOpacity*100)}}%</label>' +
              '<span class="range"> <input @change="setProps(\'point\')" v-model="point.strokeOpacity" type="range" min="0" step="0.01" max="1" value="1" id="lower"></span>' +
            '</div>' +

            //polygon lineDash xxx
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t55}}</label>' +
              '<input @input="setProps(\'point\')" class="input1" v-model="point.lineDash" type="text" :placeholder="lang.l.t59">' +
            '</div>' +

            //lineWidth - nokta
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t36}} : {{point.lineWidth}}px</label>' +
              '<span class="range"> <input @change="setProps(\'point\')" v-model="point.lineWidth" type="range" min="0" step="0.5" max="20" value="1" id="lower"></span>' +
            '</div>' +

            //radius - nokta
            '<div class="field inverted" style="margin-top: 20px;">' +
              '<label class="unselect">{{lang.l.t33}} : {{point.radius}}px</label>' +
              '<span class="range"> <input @change="setProps(\'point\')" v-model="point.radius" type="range" min="1" step="1" max="50" value="1" id="lower"></span>' +
            '</div>' +

            //butonlar - nokta
            '<div class="field ui inverted tiny right floated buttons">' +
              '<button v-if="editPointNum==-1" @click="addPoint" class="ui green button">{{lang.g.add}}</button>' +
              '<button v-if="editPointNum!==-1" @click="addPoint" class="ui orange button">{{lang.g.saveupdates}}</button>' +
            '</div>' +

          '</div>' +
          //nokta stillendirmesi bitişi



          //polygon stillendirmesi başlangıcı
          '<div v-if="workingn.type==\'polygon\'">' +

          //polygon min-max
          '<h3 class="ui dividing unselect header inverted">{{lang.l.t44}}</h3>' +
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t27}} - {{lang.g.min}} : {{polygon.min}} | {{lang.g.max}} : {{polygon.max}}</label>' +
            '<span class="multi-range"> <input style="width:435px;" @change="setProps(\'polygon\')" v-model="polygon.min" type="range" min="0" max="22" value="0" id="lower"> <input @change="setProps(\'polygon\')" style="width:435px;" v-model="polygon.max" type="range" min="0" max="22" value="22" id="upper"> </span>' +
          '</div>' +

          //polygon fillColor
          '<div class="field inverted" style="margin-top: 50px;">' +
            '<label class="unselect">{{lang.l.t31}}</label>' +
            '<div class="ui icon input inverted">' +
              '<input @input="setProps(\'polygon\')" type="text" class="input1" v-model="polygon.fillColor" :style="{color:polygon.fillColor+ \'!important\',textShadow:\'1px 1px #000 !important\'}">' +
              '<i @click="colorPalette(\'polygon.fillColor\')" class="inverted circular eye dropper link icon"></i>' +
            '</div>' +
          '</div>' +

          //polygon fillOpacity
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t34}} : {{parseInt(polygon.fillOpacity*100)}}%</label>' +
            '<span class="range"> <input @change="setProps(\'polygon\')" v-model="polygon.fillOpacity" type="range" min="0" step="0.01" max="1" value="1" id="lower"></span>' +
          '</div>' +

          //polygon strokeColor
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t32}}</label>' +
            '<div class="ui icon input inverted">' +
              '<input @input="setProps(\'polygon\')" type="text" class="input1" v-model="polygon.strokeColor" :style="{color:polygon.strokeColor+ \'!important\',textShadow:\'1px 1px #000 !important\'}">' +
              '<i @click="colorPalette(\'polygon.strokeColor\')" class="inverted circular eye dropper link icon"></i>' +
            '</div>' +
          '</div>' +

          //polygon strokeOpacity
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t35}} : {{parseInt(polygon.strokeOpacity*100)}}%</label>' +
            '<span class="range"> <input @change="setProps(\'polygon\')" v-model="polygon.strokeOpacity" type="range" min="0" step="0.01" max="1" value="1" id="lower"></span>' +
          '</div>' +

          //polygon lineWidth
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t36}} : {{polygon.lineWidth}}px</label>' +
            '<span class="range"> <input @change="setProps(\'polygon\')" v-model="polygon.lineWidth" type="range" min="0" step="0.5" max="20" value="1" id="lower"></span>' +
          '</div>' +

          //polygon lineJoin
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t53}}</label>' +
            '<select @change="setProps(\'polygon\')" v-model="lineJoin.selected" style="outline: none;" class="input1"><option v-for="(item,i) in lineJoin.data" :value="item.value">{{item.text}}</option></select>' +
          '</div>' +

          //polygon lineCap
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t54}}</label>' +
            '<select @change="setProps(\'polygon\')" v-model="lineCap.selected" style="outline: none;" class="input1"><option v-for="(item,i) in lineCap.data" :value="item.value">{{item.text}}</option></select>' +
          '</div>' +

           //polygon lineDash xxx
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t55}}</label>' +
            '<input @input="setProps(\'polygon\')" class="input1" v-model="polygon.lineDash" type="text" :placeholder="lang.l.t59">' +
          '</div>' +

          //polygon butonları
          '<div class="field ui inverted tiny right floated buttons">' +
            '<button v-if="editPointNum==-1" @click="addPolygon" class="ui green button">{{lang.g.add}}</button>' +
            '<button v-if="editPointNum!==-1" @click="addPolygon" class="ui orange button">{{lang.g.saveupdates}}</button>' +
          '</div>' +


          '</div>' +
          //polygon stillendirmesi bitişi




          //linestring stillendirmesi başlangıcı
          '<div v-if="workingn.type==\'linestring\'">' +

          //linestring min-max
          '<h3 class="ui dividing unselect header inverted">{{lang.l.t45}}</h3>' +
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t27}} - {{lang.g.min}} : {{linestring.min}} | {{lang.g.max}} : {{linestring.max}}</label>' +
            '<span class="multi-range"> <input style="width:435px;" @change="setProps(\'linestring\')" v-model="linestring.min" type="range" min="0" max="22" value="0" id="lower"> <input @change="setProps(\'linestring\')" style="width:435px;" v-model="linestring.max" type="range" min="0" max="22" value="22" id="upper"> </span>' +
          '</div>' +

          //linestring strokeColor
          '<div class="field inverted" style="margin-top: 50px;">' +
            '<label class="unselect">{{lang.l.t46}}</label>' +
            '<div class="ui icon input inverted">' +
              '<input @input="setProps(\'linestring\')" type="text" class="input1" v-model="linestring.strokeColor" :style="{color:linestring.strokeColor+ \'!important\',textShadow:\'1px 1px #000 !important\'}">' +
              '<i @click="colorPalette(\'linestring.strokeColor\')" class="inverted circular eye dropper link icon"></i>' +
            '</div>' +
          '</div>' +

          //linestring strokeOpacity
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t47}} : {{parseInt(linestring.strokeOpacity*100)}}%</label>' +
            '<span class="range"> <input @change="setProps(\'linestring\')" v-model="linestring.strokeOpacity" type="range" min="0" step="0.01" max="1" value="1" id="lower"></span>' +
          '</div>' +

          //linestring lineWidth
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t48}} : {{linestring.lineWidth}}px</label>' +
            '<span class="range"> <input @change="setProps(\'linestring\')" v-model="linestring.lineWidth" type="range" min="0" step="0.5" max="20" value="1" id="lower"></span>' +
          '</div>' +

          //linestring lineJoin
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t53}}</label>' +
            '<select @change="setProps(\'linestring\')" v-model="lineJoin.selected" style="outline: none;" class="input1"><option v-for="(item,i) in lineJoin.data" :value="item.value">{{item.text}}</option></select>' +
          '</div>' +

          //linestring lineCap
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t54}}</label>' +
            '<select @change="setProps(\'linestring\')" v-model="lineCap.selected" style="outline: none;" class="input1"><option v-for="(item,i) in lineCap.data" :value="item.value">{{item.text}}</option></select>' +
          '</div>' +

          //linestring lineDash xxx
          '<div class="field inverted" style="margin-top: 20px;">' +
            '<label class="unselect">{{lang.l.t55}}</label>' +
            '<input @input="setProps(\'linestring\')" class="input1" v-model="linestring.lineDash" type="text" :placeholder="lang.l.t59">' +
          '</div>' +
          

          //linestring butonları
          '<div class="field ui inverted tiny right floated buttons">' +
            '<button v-if="editPointNum==-1" @click="addLineString" class="ui green button">{{lang.g.add}}</button>' +
            '<button v-if="editPointNum!==-1" @click="addLineString" class="ui orange button">{{lang.g.saveupdates}}</button>' +
          '</div>' +


          '</div>' +
          //linestring stillendirmesi bitişi

          // sisteme kaydetme kısmı
          '<h3 class="ui dividing unselect header inverted" style="margin-top: 70px;">{{lang.l.t22}}</h3>' +

          //görünümün adı
          '<div class="field inverted" style="margin-bottom: 20px;">' +
            '<label class="unselect">{{lang.l.t23}}</label>' +
            '<input class="input1" v-model="newstylename" type="text" :placeholder="lang.l.t23">' +
          '</div>' +

          //görünüm global mi bu dosya için mi
          '<label style="margin-top: 10px;" class="unselect">{{lang.l.t24}}</label><br>' +
          '<div class="ui checkbox toggle" style="margin-top: 5px;">' +
            '<input v-model="isGlobal" type="checkbox">' +
            '<label class="unselect" :style="isGlobal==true?active:passive" >{{isGlobal==true?lang.l.t25:lang.l.t26}}</label>' +
          '</div>' +

          '<div class="field ui inverted tiny right floated buttons" style="margin-top: 20px;">' +
            '<button v-if="(table.point.length>0 || table.polygon.length>0 || table.linestring.length>0) && editStyleId==-1" @click="saveStyle" class="ui green button">{{lang.l.t61}}</button>' +
            '<button v-if="(table.point.length>0 || table.polygon.length>0 || table.linestring.length>0) && editStyleId!==-1" @click="saveStyle" class="ui green button">{{lang.l.t62}}</button>' +
            '<button v-if="table.point.length>0 || table.polygon.length>0 || table.linestring.length>0" @click="cancel(\'canceling\')" class="ui green button">{{lang.g.cancel}}</button>' +
          '</div>' +

        '</div>' +

        

      '</div>' +
    '</div>' +
    //sol taraf

    //sağ taraf
    '<div class="ten wide column"><div id="testmap" class="maptest"></div>' +
    //sağ taraf

    //nokta tablosu
    '<div v-if="table.point.length>0" style="margin-top: 20px;">'+
    '<h2 class="ui dividing unselect header inverted">{{lang.l.t37}}</h2>' +
    '<table class="ui celled table inverted" style="width:100%; margin-top: 20px; font-size: 10px;">'+
      '<thead>'+
        '<tr>'+
          '<th>#</th>'+
          '<th>Min</th>'+
          '<th>Max</th>'+
          '<th>{{lang.l.t38}}</th>'+
          '<th>{{lang.l.t39}}</th>'+
          '<th>{{lang.l.t40}}</th>'+
          '<th>{{lang.l.t41}}</th>'+
          '<th>{{lang.l.t42}}</th>'+
          '<th>Dash</th>'+
          '<th>{{lang.l.t43}}</th>'+
          '<th>{{lang.g.edit}}</th>'+
          '<th>{{lang.g.delete}}</th>'+
        '</tr>'+
      '</thead>'+
      '<tbody>'+
        '<tr :style="workingn.i==i?{backgroundColor:\'#444\'}:{}" v-for="(item,i) in table.point">'+
          '<td>{{i+1}}</td>'+
          '<td>{{item.min}}</td>'+
          '<td>{{item.max}}</td>'+
          '<td :style="{color:item.fillColor}">{{item.fillColor}}</td>'+
          '<td>{{item.fillOpacity}}</td>'+
          '<td :style="{color:item.strokeColor}">{{item.strokeColor}}</td>'+
          '<td>{{item.strokeOpacity}}</td>'+
          '<td>{{item.lineWidth}}</td>'+
          '<td>{{item.lineDash}}</td>'+
          '<td>{{item.radius}}</td>'+
          '<td><div @click="editPoint(i)" class="ui mini vertical green animated button" tabindex="0"> <div class="hidden content">Düzenle</div> <div class="visible content"> <i class="pencil alternate icon"></i> </div> </div></td>'+
          '<td><div @click="deletePoint(i)" class="ui mini vertical orange animated button" tabindex="0"> <div class="hidden content">Sil</div> <div class="visible content"> <i class="trash alternate icon"></i> </div> </div></td>'+
        '</tr>'+
      '</tbody>'+
    '</table></div>'+
    //nokta tablosu


    //polygon tablosu
    '<div v-if="table.polygon.length>0" style="margin-top: 20px;">'+
    '<h2 class="ui dividing unselect header inverted">{{lang.l.t44}}</h2>' +
    '<table class="ui celled table inverted" style="width:100%; margin-top: 20px; font-size: 10px;">'+
      '<thead>'+
        '<tr>'+
          '<th>#</th>'+
          '<th>Min</th>'+
          '<th>Max</th>'+
          '<th>{{lang.l.t38}}</th>'+
          '<th>{{lang.l.t39}}</th>'+
          '<th>{{lang.l.t40}}</th>'+
          '<th>{{lang.l.t41}}</th>'+
          '<th>{{lang.l.t42}}</th>'+
          '<th>Join</th>'+
          '<th>Cap</th>'+
          '<th>Dash</th>'+
          '<th>{{lang.g.edit}}</th>'+
          '<th>{{lang.g.delete}}</th>'+
        '</tr>'+
      '</thead>'+
      '<tbody>'+
        '<tr :style="workingn.i==i?{backgroundColor:\'#444\'}:{}" v-for="(item,i) in table.polygon">'+
          '<td>{{i+1}}</td>'+
          '<td>{{item.min}}</td>'+
          '<td>{{item.max}}</td>'+
          '<td :style="{color:item.fillColor}">{{item.fillColor}}</td>'+
          '<td>{{item.fillOpacity}}</td>'+
          '<td :style="{color:item.strokeColor}">{{item.strokeColor}}</td>'+
          '<td>{{item.strokeOpacity}}</td>'+
          '<td>{{item.lineWidth}}</td>'+
          '<td>{{item.lineJoin}}</td>'+
          '<td>{{item.lineCap}}</td>'+
          '<td>{{item.lineDash}}</td>'+
          '<td><div @click="editPolygon(i)" class="ui mini vertical green animated button" tabindex="0"> <div class="hidden content">Düzenle</div> <div class="visible content"> <i class="pencil alternate icon"></i> </div> </div></td>'+
          '<td><div @click="deletePolygon(i)" class="ui mini vertical orange animated button" tabindex="0"> <div class="hidden content">Sil</div> <div class="visible content"> <i class="trash alternate icon"></i> </div> </div></td>'+
        '</tr>'+
      '</tbody>'+
    '</table></div>'+
    //polygon tablosu


    //linestring tablosu
    '<div v-if="table.linestring.length>0" style="margin-top: 20px;">'+
    '<h2 class="ui dividing unselect header inverted">{{lang.l.t44}}</h2>' +
    '<table class="ui celled table inverted" style="width:100%; margin-top: 20px; font-size: 10px;">'+
      '<thead>'+
        '<tr>'+
          '<th>#</th>'+
          '<th>Min</th>'+
          '<th>Max</th>'+
          '<th>{{lang.l.t40}}</th>'+
          '<th>{{lang.l.t41}}</th>'+
          '<th>{{lang.l.t42}}</th>'+
          '<th>Join</th>'+
          '<th>Cap</th>'+
          '<th>Dash</th>'+
          '<th>{{lang.g.edit}}</th>'+
          '<th>{{lang.g.delete}}</th>'+
        '</tr>'+
      '</thead>'+
      '<tbody>'+
        '<tr :style="workingn.i==i?{backgroundColor:\'#444\'}:{}" v-for="(item,i) in table.linestring">'+
          '<td>{{i+1}}</td>'+
          '<td>{{item.min}}</td>'+
          '<td>{{item.max}}</td>'+
          '<td :style="{color:item.strokeColor}">{{item.strokeColor}}</td>'+
          '<td>{{item.strokeOpacity}}</td>'+
          '<td>{{item.lineWidth}}</td>'+
          '<td>{{item.lineJoin}}</td>'+
          '<td>{{item.lineCap}}</td>'+
          '<td>{{item.lineDash}}</td>'+
          '<td><div @click="editLineString(i)" class="ui mini vertical green animated button" tabindex="0"> <div class="hidden content">Düzenle</div> <div class="visible content"> <i class="pencil alternate icon"></i> </div> </div></td>'+
          '<td><div @click="deleteLineString(i)" class="ui mini vertical orange animated button" tabindex="0"> <div class="hidden content">Sil</div> <div class="visible content"> <i class="trash alternate icon"></i> </div> </div></td>'+
        '</tr>'+
      '</tbody>'+
    '</table></div>'+
    //linestring tablosu

    '</div>' +
    '</div>'
});