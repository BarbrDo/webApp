module.exports = function(app, express) {
    let router = express.Router();
    let customerController = require('./../../controllers/customer');
    let shopController = require('./../../controllers/shop');
    // let appointController = require('./../../controllers/appointment');
    let barberController = require('./../../controllers/barber');
    let userController = require('./../../controllers/user');
    let adminController = require('./../../controllers/admin')

    //Count all Users, appointsments
    app.get('/api/v2/countbarber', barberController.countbarber);
    app.get('/api/v2/countshop', shopController.countshop);
    app.get('/api/v2/countcustomer', customerController.countcustomer);
    app.get('/api/v2/countappoint', customerController.countappoint);

    //Updation Of Customer
    app.put('/api/v2/deletecustomer/:cust_id', customerController.deletecustomer);
    app.put('/api/v2/undeletecustomer/:cust_id', customerController.undeletecustomer);
    app.put('/api/v2/deactivecust/:cust_id', customerController.deactivecustomer);
    app.put('/api/v2/activatecust/:cust_id', customerController.activatecustomer);
    app.put('/api/v2/disapprovecust/:cust_id', customerController.disapprovecustomer);
    app.put('/api/v2/verifycust/:cust_id', customerController.verifycustomer);
    app.get('/api/v2/allcustomers', customerController.listcustomers);
    app.post('/api/v2/allappointment', customerController.allappointment);
    app.get('/api/v2/appointment/current/:_id', customerController.currentAppointment);
    app.put('/api/v2/barber/updateSubscription',userController.updateSubscribeDate);


    //Updation Of Barber
    app.put('/api/v2/deletebarber/:barber_id', barberController.deletebarber);
    app.put('/api/v2/undeletebarber/:barber_id', barberController.undeletebarber);
    app.put('/api/v2/activatebarber/:barber_id', barberController.activatebarber);
    app.put('/api/v2/deactivebarber/:barber_id', barberController.deactivebarber);
    app.put('/api/v2/disapprovebarber/:barber_id', barberController.disapprovebarber);
    app.put('/api/v2/verifybarber/:barber_id', barberController.verifybarber);
    app.get('/api/v2/allbarbers', barberController.availableBarber);
    app.post('/api/v2/allbarbers/new', barberController.availableBarbernew);

    //Updation Of Shop
    app.put('/api/v2/deleteshop/:shop_id', shopController.deleteshop);
    app.put('/api/v2/undeleteshop/:shop_id', shopController.undeleteshop);
    app.put('/api/v2/activateshop/:shop_id', shopController.activateshop);
    app.put('/api/v2/deactiveshop/:shop_id', shopController.deactiveshop);
    app.put('/api/v2/disapproveshop/:shop_id', shopController.disapproveshop);
    app.put('/api/v2/verifyshop/:shop_id', shopController.verifyshop);
    app.get('/api/v2/allshops', shopController.listshops);
    app.get('/api/v2/shopdetail/:shop_id', shopController.shopdetail);
    app.get('/api/v2/shops', shopController.allshops);
    app.put('/api/v2/shops', shopController.updateShop);
    app.get('/api/v2/shopinvites', shopController.shopinvites);
    app.get('/api/v2/currentshopinvite/:_id', shopController.currentshopinvite);
    app.get('/api/v2/currentshopupdate/:_id', shopController.currentshopupdate);
    app.get('/api/v2/currentshopdelete/:_id', shopController.currentshopdelete);
    app.post('/api/v2/shop/save',shopController.saveShop);

    // refer app module admin
    app.get('/api/v2/getReferUsers', barberController.getReferUsers)
    app.post('/api/v2/referDetail', barberController.referDetail)
    app.post('/api/v2/giftCard',adminController.giftCard)

 app.get('/api/v2/barber/cutingservices', barberController.showServices);

    app.get('/api/v2/shopownerwithshops/:user_id', shopController.shopownerhavingshops);
    app.get('/api/v2/barberdetail/:barber_id', barberController.barberdetail); //get Barberdetails
    app.get('/api/v2/custdetail/:cust_id', customerController.custdetail); //get Customerdetails
    app.get('/api/v2/chairdetail/:chair_id', shopController.chairdetail); //get Chairdetails
    // app.get('/api/v2/customerappointments/:cust_id', customerController.customerappointments);//get customer appointments

    app.get('/api/v1/services', userController.getAllServices); //Get all services
    app.post('/api/v1/services', userController.addServices); //Add new service by Admin
    app.put('/api/v1/services/:service_id', userController.editServices); //Edit service by Admin
    app.delete('/api/v1/enableservices/:service_id', userController.enableServices); //Enable service by Admin
    app.delete('/api/v1/services/:service_id', userController.deleteServices); //Delete service by Admin

}