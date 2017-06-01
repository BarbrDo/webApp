module.exports = function(app, express) {
    var router = express.Router();
    let customerController = require('./../../controllers/customer');
    let shopController = require('./../../controllers/shop');
   
  

    app.post('/api/v1/allshops',shopController.listshops);
    app.post('/api/v1/allcustomers',customerController.listcustomers);
    app.put('/api/v1/updatecust/:cust_id',customerController.updatecustomer);
    app.put('/api/v1/updatebarber/:barber_id',customerController.updatebarber);
    app.put('/api/v1/updateshop/:shop_id',shopController.updateshop);
    app.put('/api/v1/updatechair/:chair_id',shopController.updatechair);
    app.put('/api/v1/deletecustomer/:cust_id',customerController.deletecustomer);
    app.put('/api/v1/deactivecust/:cust_id',customerController.deactivecustomer);
    app.put('/api/v1/deletebarber/:barber_id',customerController.deletebarber);
    // app.put('/api/v1/deleteshop/:shop_id',shopController.deleteshop);
    app.post('/api/v1/addbarber', customerController.addbarber); // Add Barbers
    app.get('/api/v1/countbarber', customerController.countbarber); // Add Barbers
    app.get('/api/v1/countshop', customerController.countshop); 
    app.get('/api/v1/countcustomer', customerController.countcustomer); 
}