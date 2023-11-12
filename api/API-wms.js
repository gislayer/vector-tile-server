

module.exports = {
  getWMS(req,res){
    var fileid = req.params.fileid;
    var name = req.params.name;
    var query = req.query;
    var props = {};
    res.send({});
  }
};