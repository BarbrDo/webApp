var barber = require('../models/barber');
var constantObj = require('./../constants.js');

exports.editBarber = function (req, res) {
    var updateData = JSON.parse(JSON.stringify(req.body));
    updateData.modified_date = new Date();
    delete updateData._id;
    if ((req.files) && (req.files.length > 0)) {
        var userimg = [];
        for (var i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == 'image') {
                updateData.image = req.files[i].filename;
            }
            else {
                var obj = {};
                obj.name = req.files[i].filename;
                userimg.push(obj);
            }
        }
        updateData.gallery = userimg;
    }
    // console.log("updateData",updateData);
    barber.update({
        _id: req.body._id
    }, updateData, function (err, data) {
        if (err) {
            res.status(400).send({
                msg: 'Error in updating data.',
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fields.',
                "data": data
            });
        }
    })
}