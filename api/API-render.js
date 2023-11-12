const { createCanvas } = require('canvas')


function render(obj, option) {
  const size = option.bitmapsize;
  const scaling = size / 4096; // Coordinates 0-4095 in MVT
  var canvas = createCanvas(size,size);
  const ctx = canvas.getContext("2d");
  ctx.antialias = option.antialias;

  Object.keys(obj.layers).forEach(key =>
    drawGeometries(ctx, obj.layers[key].features, obj.style, scaling, option)
  );

  var time = Date.now();
  //const out = fs.createWriteStream(__dirname + '/test'+time+'.png')
  const stream = ctx.canvas.createPNGStream()
  //stream.pipe(out)
  //out.on('finish', () =>  console.log('The PNG file was created.'))
  return canvas.toBuffer();
}

function drawGeometries(ctx, features, style, scaling, option) {
  features.forEach(feature => {
    var typeName = feature.type==3?'polygon':feature.type==2?'linestring':'point';
    for (const rule in style[typeName]) {
      var paint = style[typeName][rule];
      if(option.zoom>=paint.min && option.zoom<=paint.max){
        for (const property in paint) {
          if(["filters","min","max"].indexOf(property)==-1){
            property=="radius"?false:property=="lineDash"?ctx.setLineDash(paint[property]):ctx[property] =paint[property]     
          }
        }
        ctx.beginPath();
          feature.geometry.map(function(geom,i){
            drawGeometry(ctx, geom, feature.type, paint, scaling,i)
          });
          if(feature.type==3){
            ctx.fill();
            ctx.stroke();
          }else{
            ctx.stroke();
          } 
      }
      
      
    }
    
        
  });
}

function drawGeometry(ctx,  geom, type, style, scaling,i) {
  

  if(type==1){
    //ctx.moveTo(geom[0] * scaling,geom[1] * scaling);
    ctx.beginPath();
    ctx.arc(geom[0] * scaling, geom[1] * scaling, style.radius, 0, 2 * Math.PI);
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

module.exports = render;
