module.exports = function(app, express) {
    var router = express.Router();
    let customerController = require('./../../controllers/customer');
    let shopController = require('./../../controllers/shop');
    let appointController = require('./../../controllers/appointment');
    let barberController = require('./../../controllers/barber');
    
    //Count all Users, appointsments  
    app.post('/api/v1/loginadmin',customerController.login);

    app.get('/api/v1/countbarber', barberController.countbarber); 
    app.get('/api/v1/countshop', shopController.countshop); 
    app.get('/api/v1/countcustomer', customerController.countcustomer); 
    app.get('/api/v1/countappoint', appointController.countappoint);

    //Updation Of Customer
    app.put('/api/v1/deletecustomer/:cust_id',customerController.deletecustomer);
    app.put('/api/v1/undeletecustomer/:cust_id',customerController.undeletecustomer);
    app.put('/api/v1/deactivecust/:cust_id',customerController.deactivecustomer);
    app.put('/api/v1/activatecust/:cust_id',customerController.activatecustomer);
    app.put('/api/v1/disapprovecust/:cust_id',customerController.disapprovecustomer);
    app.put('/api/v1/verifycust/:cust_id',customerController.verifycustomer);

    //Updation Of Barber
    app.put('/api/v1/deletebarber/:barber_id',barberController.deletebarber);
    app.put('/api/v1/undeletebarber/:barber_id',barberController.undeletebarber);
    app.put('/api/v1/activatebarber/:barber_id',barberController.activatebarber);
    app.put('/api/v1/deactivebarber/:barber_id',barberController.deactivebarber);
    app.put('/api/v1/disapprovebarber/:barber_id',barberController.disapprovebarber);
    app.put('/api/v1/verifybarber/:barber_id',barberController.verifybarber);

    //Updation Of Shop
    app.put('/api/v1/deleteshop/:shop_id',shopController.deleteshop);
    app.put('/api/v1/undeleteshop/:shop_id',shopController.undeleteshop);
    app.put('/api/v1/activateshop/:shop_id',shopController.activateshop);
    app.put('/api/v1/deactiveshop/:shop_id',shopController.deactiveshop);
    app.put('/api/v1/disapproveshop/:shop_id',shopController.disapproveshop);
    app.put('/api/v1/verifyshop/:shop_id',shopController.verifyshop);


    app.get('/api/v1/shopownerwithshops/:user_id', shopController.shopownerhavingshops);
    app.get('/api/v1/barberdetail/:barber_id', barberController.barberdetail);//get Barberdetails
    app.get('/api/v1/custdetail/:cust_id', customerController.custdetail);//get Customerdetails
    app.get('/api/v1/chairdetail/:chair_id', shopController.chairdetail);//get Chairdetails
    app.get('/api/v1/customerappointments/:cust_id', customerController.customerappointments);//get customer appointments
    
}
