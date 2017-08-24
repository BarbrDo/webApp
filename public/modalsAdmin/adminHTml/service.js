angular.module('barbrdo').factory('Admin', function($http) {
  return {
    login: function(data) {
      return $http.post('/api/v2/loginadmin', data);
    },
    loggedin : function(data) {
      return $http.get('/api/v2/loggedin', data);
    },
    barbers: function(data) {
      if (data.search) {
        return $http.get('/api/v2/allbarbers?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/allbarbers?page=' + data.page + '&count=' + data.count);
      }
    },
    shopsAll: function(data) {
      if (data.search) {
        return $http.get('/api/v2/allshops?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/allshops?page=' + data.page + '&count=' + data.count, data);
      }
    },
    customersAll: function(data) {
      if (data.search) {
        return $http.get('/api/v2/allcustomers?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/allcustomers?page=' + data.page + '&count=' + data.count, data);
      }
    },
    shopDetail: function(data) {
      return $http.get('/api/v2/shopownerwithshops/' + data, data);
    },
    chairDetail: function(data) {
      return $http.get('/api/v2/chairdetail/' + data, data);
    },
    custDetail: function(data) {
      return $http.get('/api/v2/custdetail/' + data, data);
    },
    updateCustomer: function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v2/account',
        headers: {
          'user_id': data._id
        },
        data: {
          created_date:data.created_date,
          email:data.email,
          first_name:data.first_name,
          isActive:data.isActive,
          isDeleted:data.isDeleted,
          is_verified:data.is_verified,
          last_name:data.last_name,
          mobile_number:data.mobile_number,
          password:data.pass,
          ratings:data.ratings,
          user_type:data.user_type,
          _id:data._id,
          confirm:data.confirmPassword
        }
      });
    },
    appointments: function(data) {
      console.log("in service",data);
      if (data.search) {
        return $http.get('/api/v2/allappointment?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/allappointment?page=' + data.page + '&count=' + data.count, data);
      }
    },
    custAppoints: function(data) {
      return $http.get('/api/v2/customerappointments/' + data, data);
    },
    barberAppoints: function(data) {
      return $http({
        method: 'GET',
        url: '/api/v2/barber/appointments',
        headers: {
          'user_id': data
        }
      });
    },
    confirmAppoint: function(data) {
      console.log(data)
      return $http.put('/api/v2/barber/confirmappointment/' + data._id);
    },
    markComplete: function(data, barberid) {
      return $http({
        method: 'PUT',
        url: '/api/v2/barber/completeappointment/'+data._id,
        headers: {
          'user_id': barberid
        },
        data: {
          customer_id: data.customer_id._id,
          score: data.barber_id.ratings[0].score,
          rated_by_name: data.barber_id.ratings[0].rated_by_name,
          comments: data.barber_id.ratings[0].comments,
          appointment_date: data.appointment_date
        }
      });
    },
    rescheduleAppoint: function(data,time) {
       return $http({
        method: 'PUT',
        url: '/api/v2/barber/rescheduleappointment/'+data._id,
        data: {
          minutes: time,
          appointment_date: data.appointment_date
        }
      });
    },
    cancelAppoint: function(data)
    {
      return $http.put('/api/v2/barber/cancelappointment/'+data._id)
    },
    deactiveCustomer: function(data) {
      return $http.put('/api/v2/deactivecust/' + data._id, data);
    },
    barberDetail: function(data) {
      return $http.get('/api/v2/barberdetail/' + data, data);
    },
    activateCustomer: function(data) {
      return $http.put('/api/v2/activatecust/' + data._id, data);
    },
    disapproveCustomer: function(data) {
      return $http.put('/api/v2/disapprovecust/' + data._id, data);
    },
    verifyCustomer: function(data) {
      return $http.put('/api/v2/verifycust/' + data._id, data);
    },
    deactiveShop: function(data) {
      return $http.put('/api/v2/deactiveshop/' + data._id, data);
    },
    activateShop: function(data) {
      return $http.put('/api/v2/activateshop/' + data._id, data);
    },
    disapproveShop: function(data) {
      return $http.put('/api/v2/disapproveshop/' + data._id, data);
    },
    verifyShop: function(data) {
      return $http.put('/api/v2/verifyshop/' + data._id, data);
    },
    deactiveBarber: function(data) {
      return $http.put('/api/v2/deactivebarber/' + data._id, data);
    },
    disapproveBarber: function(data) {
      return $http.put('/api/v2/disapprovebarber/' + data._id, data);
    },
    activateBarber: function(data) {
      return $http.put('/api/v2/activatebarber/' + data._id, data);
    },
    verifyBarber: function(data) {
      return $http.put('/api/v2/verifybarber/' + data._id, data);
    },
    updateBarber: function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v2/account',
        headers: {
          'user_id': data._id
        },
         data: data
      });
    },
    updateShop: function(data) {
      console.log(data)
      return $http({
        method: 'PUT',
        url: '/api/v2/account',
        headers: {
          'user_id': data._id
        },
        data: {
          created_date:data.created_date,
          email:data.email,
          first_name:data.first_name,
          isActive:data.isActive,
          isDeleted:data.isDeleted,
          is_verified:data.is_verified,
          last_name:data.last_name,
          mobile_number:data.mobile_number,
          password:data.confirmPassword,
          ratings:data.ratings,
          shopinfo:data.shopinfo,
          user_type:data.user_type,
          _id:data._id,
          confirm:data.confirmPassword
        }
      });
    },
    updateShopinfo: function(data) {
      return $http.put('/api/v2/shops', data);
    },
    addChair: function(data) {
      return $http.post('/api/v2/shops/chair', data);
    },
    deleteChair: function(data) {
      return $http({
        method: 'DELETE',
        url: '/api/v2/shops/chair',
        data: data,
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        }
      });
    },
    markChairBooked: function(data, id) {
      return $http({
        method: 'PUT',
        url: '/api/v2/shops/markchairasbooked/' + data._id,
        headers: {
          'user_id': id,
          'chair_id': data._id
        }
      });
    },
    postChair: function(data, id) {
      return $http({
        method: 'PUT',
        url: '/api/v2/shops/postchairtoallbarbers',
        headers: {
          'user_id': id
        },
        data: {
          chair_id: data._id
        }
      });
    },
    updateChair: function(data, id) {
      console.lo
      return $http({
        method: 'PUT',
        url: '/api/v2/shops/managechair',
        headers: {
          'user_id': id
        },
        data: {
          chair_id: data._id,
          type: data.type,
          shop_percentage: data.shop_percentage,
          barber_percentage: data.barber_percentage,
          amount: data.amount,
          booking_start: data.booking_start,
          booking_end: data.booking_end

        }
      });
    },
    deleteBarber: function(data) {
      return $http.put('/api/v2/deletebarber/' + data._id, data);
    },
    undeleteBarber: function(data) {
      return $http.put('/api/v2/undeletebarber/' + data._id, data);
    },
    deleteShop: function(data) {
      return $http.put('/api/v2/deleteshop/' + data._id, data);
    },
    undeleteShop: function(data) {
      return $http.put('/api/v2/undeleteshop/' + data._id, data);
    },
    deleteCustomer: function(data) {
      return $http.put('/api/v2/deletecustomer/' + data._id, data);
    },
    undeleteCustomer: function(data) {
      return $http.put('/api/v2/undeletecustomer/' + data._id, data);
    },
    barberList: function(data) {
      return $http.get('/api/v2/shops/barbers/' + data._id, data);
    },
    addCustomer: function(cust) {
      console.log(cust)
      return $http.post('/api/v2/signup', cust);
    },
    countBarber: function(data) {
      return $http.get('/api/v2/countbarber', data);
    },
    countShop: function(data) {
      return $http.get('/api/v2/countshop', data);
    },
    countCustomer: function(data) {
      return $http.get('/api/v2/countcustomer', data);
    },
    countAppointment: function(data) {
      return $http.get('/api/v2/countappoint', data);
    },
    featuringPlans: function(data) {
      return $http.get('/api/v2/stripe/plans', data);
    },
    createPlan:function (data) {
      return $http.post('/api/v2/stripe/createPlan', data)
    },
    updatePlan:function (data) {
      return $http.put('/api/v2/stripe/updatePlan', data)
    },
    deletePlan:function (data) {
      return $http.put('/api/v2/stripe/deletePlan', data)
    },
    allPayments:function (data) {
      if (data.search) {
        return $http.get('/api/v2/allPayments?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/allPayments?page=' + data.page + '&count=' + data.count);
      }
    },
    allRecords:function (data) {
      return $http.get('/api/v2/records', data);
    },
    graphicData:function (data) {
      return $http.get('/api/v2/totalUsers',data);
    },
    allservices : function() {
      return $http.get('/api/v2/services');
    },
    addServices : function(data) {
       return $http({
        method: 'POST',
        url: '/api/v2/services',
        data: data
      });
    },
    editServices : function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v2/services/'+data.service_id,
        data: data
      });
    },
    disableServices : function(data) {
      return $http({
        method: 'DELETE',
        url: '/api/v2/services/'+data.service_id,
        data: data
      });
    },
    enableServices : function(data) {
      return $http({
        method: 'DELETE',
        url: '/api/v2/enableservices/'+data.service_id,
        data: data
      });
    },
    getAllShops:function (data) {
      return $http.get('/api/v2/shops');
    },
    addShopsWithbarber:function (data) {
      return $http({
        method: 'post',
        url: '/api/v2/barber/shop',
        headers: {
          'user_id': data.user_id
        },
        data: data
      });
    },
    removeAssociateShop: function(data) {
      return $http({
        method: 'DELETE',
        url: '/api/v2/barber/associatedshops',
        data: data,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          'user_id': data.user_id
        }
      });
    },
    makeDefaultShop:function (data) {
      return $http({
        method: 'post',
        url: '/api/v2/barber/makeDefaultshop',
        headers: {
          'user_id': data.user_id
        },
        data: data
      });
    },
    barberServices:function(data){
      return $http({
        method: 'get',
        url: '/api/v2/barber/cutingservices'
      });
    },
    goOnline:function  (obj,services) {
      return $http({
        method: 'post',
        url: '/api/v2/barber/goOnline',
        headers: {
          'user_id': obj.barber_id
        },
        data: {
          services:services,
          shop_id:obj.shop_id
        }
      });
    },
    goOffline:function(data){
      return $http({
        method: 'put',
        url: '/api/v2/barber/goOffline',
        headers: {
          'user_id': data.barber_id
        }
      });
    },
    getReferUsers: function(data) {
      if (data.search) {
        return $http.get('/api/v2/getReferUsers?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/getReferUsers?page=' + data.page + '&count=' + data.count);
      }
    },
    getUserData: function(data) {
      return $http.get('/api/v2/referDetail/' + data._id, data);
    },
    getShopInvites:function(data){
      if (data.search) {
        return $http.get('/api/v2/shopinvites?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v2/shopinvites?page=' + data.page + '&count=' + data.count);
      }
    },
    getInviteShopProfile: function(data) {
      return $http.get('/api/v2/currentshopinvite/' + data._id, data);
    },
     updateInviteShopProfile: function(data) {
      return $http.get('/api/v2/currentshopupdate/' + data._id, data);
    },
    deleteInviteShopProfile: function(data) {
      return $http.get('/api/v2/currentshopdelete/' + data._id, data);
    }
  };
});
