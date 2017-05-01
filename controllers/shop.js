var shop = require('../models/shop');
var constantObj = require('./../constants.js');

exports.editShop = function(req, res) {
	console.log(req.body);
	var updateData = JSON.parse(JSON.stringify(req.body));

	console.log(updateData);
	delete updateData._id;
	if (req.files.length > 0) {
		updateData.image = req.files[0].filename;
	}
	shop.update({
		_id: req.body._id
	}, updateData, function(err, data) {
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