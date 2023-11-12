var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("anasayfa çalışıyor");
  res.render('index', { title: 'GISLayer Local Tile Server' });
});

router.get('/status', function(req, res, next) {
  res.send({status:req.app.locals.status});
});

const files = require('./API-files');
router.post('/addfile',files.add);
router.get('/getfiles',files.filelist);
router.post('/getfile',files.getfile);
router.post('/updatefile',files.updatefile);
router.post('/deletefile',files.deletefile);

const tiles = require('./API-tiles');
router.post('/gettiles',tiles.getTiles);
router.get('/getalltiles',tiles.getAllTiles);
router.post('/savetileserver',tiles.saveTileServer);
router.post('/updatetileserver',tiles.updateTileServer);
router.post('/activetileserver',tiles.activeTileServer);
router.post('/passivetileserver',tiles.passiveTileServer);

const readyGeojsonVT = require('./API-readyGeojsonVT');
router.post('/readyGeojsonVT',readyGeojsonVT.run);
router.post('/styletest',readyGeojsonVT.test);
router.post('/stopGeojsonVT',readyGeojsonVT.stop);
router.get('/allstyles',readyGeojsonVT.getAllStyle);
router.post('/fieldbbox',readyGeojsonVT.getBboxFields);

const pbf = require('./API-pbf');
router.get('/gislayer/pbf/:name/:fileid/:z/:x/:y', pbf.getTile);

const wfs = require('./API-wfs');
router.get('/gislayer/:name/:fileid/wfs', wfs.getWFS);

//const wms = require('./API-wms');
router.get('/gislayer/:name/:fileid/wms', wfs.getWMS);

const xyz = require('./API-xyz');
router.get('/gislayer/xyz/:name/:fileid/:z/:x/:y', xyz.getTile);
router.get('/testserver/:fileid/:z/:x/:y', xyz.getTestTile);
router.get('/caching/:fileid/:type/:z/:x/:y', xyz.caching);

const styles = require('./API-styles');
router.post('/changeTestStyle',styles.changeTestStyle);
router.post('/changeCurrentTestStyle',styles.changeCurrentTestStyle);
router.post('/createstyle',styles.createStyle);


module.exports = router;