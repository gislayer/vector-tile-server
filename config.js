module.exports = {
  mode:'dev',
  api:{
    dev:'http://localhost:1881',
    prod:'https://api.gislayer.com'
  },
  runApi:"node api/API-index.js",
  title:"GISLayer Local Tile Server"
};