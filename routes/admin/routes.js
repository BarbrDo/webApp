module.exports = function(app, express) {
    var router = express.Router();
    let customerController = require('./../../controllers/customer');
    let shopController = require('./../../controllers/shop');
    // let appointController = require('./../../controllers/appointment');
    let barberController = require('./../../controllers/barber');

    //Count all Users, appointsments
    console.log("loginadmin");
    app.post('/api/v2/loginadmin',customerController.login);
    app.get('/api/v2/countbarber', barberController.countbarber);
    app.get('/api/v2/countshop', shopController.countshop);
    app.get('/api/v2/countcustomer', customerController.countcustomer);
    // app.get('/api/v2/countappoint', appointController.countappoint);

    //Updation Of Customer
    app.put('/api/v2/deletecustomer/:cust_id',customerController.deletecustomer);
    app.put('/api/v2/undeletecustomer/:cust_id',customerController.undeletecustomer);
    app.put('/api/v2/deactivecust/:cust_id',customerController.deactivecustomer);
    app.put('/api/v2/activatecust/:cust_id',customerController.activatecustomer);
    app.put('/api/v2/disapprovecust/:cust_id',customerController.disapprovecustomer);
    app.put('/api/v2/verifycust/:cust_id',customerController.verifycustomer);
    app.get('/api/v2/allcustomers',customerController.listcustomers);


    //Updation Of Barber
    app.put('/api/v2/deletebarber/:barber_id',barberController.deletebarber);
    app.put('/api/v2/undeletebarber/:barber_id',barberController.undeletebarber);
    app.put('/api/v2/activatebarber/:barber_id',barberController.activatebarber);
    app.put('/api/v2/deactivebarber/:barber_id',barberController.deactivebarber);
    app.put('/api/v2/disapprovebarber/:barber_id',barberController.disapprovebarber);
    app.put('/api/v2/verifybarber/:barber_id',barberController.verifybarber);
    app.get('/api/v2/allbarbers', barberController.availableBarber);

    //Updation Of Shop
    app.put('/api/v2/deleteshop/:shop_id',shopController.deleteshop);
    app.put('/api/v2/undeleteshop/:shop_id',shopController.undeleteshop);
    app.put('/api/v2/activateshop/:shop_id',shopController.activateshop);
    app.put('/api/v2/deactiveshop/:shop_id',shopController.deactiveshop);
    app.put('/api/v2/disapproveshop/:shop_id',shopController.disapproveshop);
    app.put('/api/v2/verifyshop/:shop_id',shopController.verifyshop);
    app.get('/api/v2/allshops',shopController.listshops);
     app.get('/api/v2/shopdetail/:shop_id', shopController.shopdetail);


    app.get('/api/v2/shopownerwithshops/:user_id', shopController.shopownerhavingshops);
    app.get('/api/v2/barberdetail/:barber_id', barberController.barberdetail);//get Barberdetails
    app.get('/api/v2/custdetail/:cust_id', customerController.custdetail);//get Customerdetails
    app.get('/api/v2/chairdetail/:chair_id', shopController.chairdetail);//get Chairdetails
    app.get('/api/v2/customerappointments/:cust_id', customerController.customerappointments);//get customer appointments

}
