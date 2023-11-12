

var GL = {};
var epsg = require('epsg');
GL.EPSG  = epsg;
GL.styles = [];
GL.userpath='';
GL.onay=function(obj){
  let a = new Notification(obj.title, {
    body: obj.content,
    silent:obj.silent || false,
    icon:'./src/img/icons/check-mark64.png'
  })
}

GL.systemStop = false;
GL.setsystemStop = function(status){
  GL.systemStop=status;
  window.ipcRenderer.send('electron', {type:'system-status',data:GL.systemStop});
}

GL.uyari=function(obj){
  let a = new Notification(obj.title, {
    body: obj.content,
    silent:obj.silent || false,
    icon:'./src/img/icons/warning.png'
  })
}

GL.hata=function(obj){
  let a = new Notification(obj.title, {
    body: obj.content,
    silent:obj.silent || false,
    icon:'./src/img/icons/error.png'
  })
}

GL.replaceAll=function(text,first,last){
  while(text.indexOf(first)!==-1){
    text = text.replace(first,last);
  }
  return text;
}

GL.getSlug = function(str) {
  str = this.replaceAll(str,'ı','i');
  str = this.replaceAll(str,'İ','i');
  str = this.replaceAll(str,'ğ','g');
  str = this.replaceAll(str,'Ğ','g');
  str = this.replaceAll(str,'ş','s');
  str = this.replaceAll(str,'Ş','s');
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.toLowerCase();

  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  return str;
}

GL.pbfToPng = function(data){
  var tile = data.tile;
  var style = data.style;

  function render(obj, option) {
    debugger;
    const size = option.bitmapsize;
    const scaling = size / 4096; // Coordinates 0-4095 in MVT
    var canvas = document.createElement('canvas');
    canvas.width=size;
    canvas.height=size;
    const ctx = canvas.getContext("2d");
    ctx.antialias = option.antialias;
  
    Object.keys(obj.layers).forEach(key =>
      drawGeometries(ctx, obj.layers[key].features, obj.style, scaling, option)
    );
  
    var time = Date.now();
    const out = fs.createWriteStream(__dirname + '/test'+time+'.png')
    const stream = ctx.canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () =>  console.log('The PNG file was created.'))
    return canvas.toBuffer();
  }
  
  function drawGeometries(ctx, features, style, scaling, option) {
    features.forEach(feature => {
      for (const property in style["type"+feature.type]) {
        property=="radius"?false:property=="lineDash"?ctx.setLineDash(style["type"+feature.type][property]):ctx[property] =style["type"+feature.type][property]       
      }
      ctx.beginPath();
      feature.geometry.map(function(geom,i){
        drawGeometry(ctx, geom, feature.type, style, scaling,i)
      });
      if(feature.type==3){
        ctx.fill();
        ctx.stroke();
      }else{
        ctx.stroke();
      }
          
    });
  }
  
  function drawGeometry(ctx,  geom, type, style, scaling,i) {
    if(type==1){
      ctx.beginPath();
      ctx.arc(geom[0] * scaling, geom[1] * scaling, style["type1"].radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  
    if(type==2){
      ctx.moveTo(geom[0][0] * scaling,geom[0][1] * scaling);
      geom.forEach(coord => ctx.lineTo(coord[0] * scaling, coord[1] * scaling));
    }
  
    if(type==3){
      ctx.moveTo(geom[0][0] * scaling,geom[0][1] * scaling);
      geom.forEach(coord => ctx.lineTo(coord[0] * scaling, coord[1] * scaling));
    }
  }

  var image = render({layers:[tile],style:style},{
    bitmapsize:256,
    antialias:true,
    color:"rgba(255,0,0,0.5)",
    colorprop:'color'
  });
}

GL.rgbToHex = function (r, g, b) {
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

GL.rgbaToHex = function(text){
  //rgba(0,0,255,0.5)
  var rgba = text.replace('rgba(','').replace(')','').split(',');
  var hex = GL.rgbToHex(Number(rgba[0]),Number(rgba[1]),Number(rgba[2]));
  var opacity = parseFloat(rgba[3]);
  return {color:hex,opacity:opacity}
}

GL.hexToRGBA = function (hex, opacity) {
  var c;

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');

    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }

    c = '0x' + c.join('');
    return 'rgba(' + [c >> 16 & 255, c >> 8 & 255, c & 255].join(',') + ',' + opacity + ')';
  }
};