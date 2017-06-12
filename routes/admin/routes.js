module.exports = function(app, express) {
    var router = express.Router();
    let customerController = require('./../../controllers/customer');
    let shopController = require('./../../controllers/shop');
    let appointController = require('./../../controllers/appointment');
    
       
    app.get('/api/v1/countbarber', customerController.countbarber); 
    app.get('/api/v1/countshop', customerController.countshop); 
    app.get('/api/v1/countcustomer', customerController.countcustomer); 
    app.get('/api/v1/countappoint', appointController.countappoint);

    app.put('/api/v1/deletecustomer/:cust_id',customerController.deletecustomer);
    app.put('/api/v1/undeletecustomer/:cust_id',customerController.undeletecustomer);
    app.put('/api/v1/deactivecust/:cust_id',customerController.deactivecustomer);
    app.put('/api/v1/activatecust/:cust_id',customerController.activatecustomer);
    app.put('/api/v1/disapprovecust/:cust_id',customerController.disapprovecustomer);
    app.put('/api/v1/verifycust/:cust_id',customerController.verifycustomer);

    app.put('/api/v1/deletebarber/:barber_id',customerController.deletebarber);
    app.put('/api/v1/undeletebarber/:barber_id',customerController.undeletebarber);
    app.put('/api/v1/activatebarber/:barber_id',customerController.activatebarber);
    app.put('/api/v1/deactivebarber/:barber_id',customerController.deactivebarber);
    app.put('/api/v1/disapprovebarber/:barber_id',customerController.disapprovebarber);
    app.put('/api/v1/verifybarber/:barber_id',customerController.verifybarber);

    app.put('/api/v1/deleteshop/:shop_id',shopController.deleteshop);
    app.put('/api/v1/undeleteshop/:shop_id',shopController.undeleteshop);
    app.put('/api/v1/activateshop/:shop_id',customerController.activateshop);
    app.put('/api/v1/deactiveshop/:shop_id',customerController.deactiveshop);
    app.put('/api/v1/disapproveshop/:shop_id',customerController.disapproveshop);
    app.put('/api/v1/verifyshop/:shop_id',customerController.verifyshop);

    app.get('/api/v1/shopdetail/:user_id', shopController.shopdetail);
    app.get('/api/v1/viewshopdetail/:user_id', shopController.viewshopdetail);
    
}
