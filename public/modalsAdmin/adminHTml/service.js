angular.module('barbrdo').factory('Admin', function($http) {
  return {
    barbers: function(data) {
      if (data.search) {
        return $http.get('/api/v1/allbarbers?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v1/allbarbers?page=' + data.page + '&count=' + data.count);
      }
    },
    shopsAll: function(data) {
      if (data.search) {
        return $http.get('/api/v1/allshops?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v1/allshops?page=' + data.page + '&count=' + data.count, data);
      }
    },
    customersAll: function(data) {
      if (data.search) {
        return $http.get('/api/v1/allcustomers?page=' + data.page + '&count=' + data.count + '&search=' + data.search, data);
      } else {
        return $http.get('/api/v1/allcustomers?page=' + data.page + '&count=' + data.count, data);
      }
    },
    shopDetail: function(data) {
      return $http.get('/api/v1/shopdetail/' + data, data);
    },
    chairDetail: function(data) {
      return $http.get('/api/v1/chairdetail/' + data, data);
    },
    custDetail: function(data) {
      return $http.get('/api/v1/custdetail/' + data, data);
    },
    updateCustomer: function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v1/account',
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
      return $http({
        method: 'GET',
        url: '/api/v1/appointment',
        headers: {
          'user_id': data._id
        },
      });
    },
    custAppoints: function(data) {
      return $http.get('/api/v1/customerappointments/' + data, data);
    },
    barberAppoints: function(data) {
      return $http({
        method: 'GET',
        url: '/api/v1/barber/appointments',
        headers: {
          'user_id': data
        }
      });
    },
    confirmAppoint: function(data) {
      console.log(data)
      return $http.put('/api/v1/barber/confirmappointment/' + data._id);
    },
    markComplete: function(data, barberid) {
      return $http({
        method: 'PUT',
        url: '/api/v1/barber/completeappointment/'+data._id,
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
        url: '/api/v1/barber/rescheduleappointment/'+data._id,
        data: {
          minutes: time,
          appointment_date: data.appointment_date
        }
      });
    },
    cancelAppoint: function(data)
    {
      return $http.put('/api/v1/barber/cancelappointment/'+data._id)
    },
    deactiveCustomer: function(data) {
      return $http.put('/api/v1/deactivecust/' + data._id, data);
    },
    barberDetail: function(data) {
      return $http.get('/api/v1/barberdetail/' + data, data);
    },
    activateCustomer: function(data) {
      return $http.put('/api/v1/activatecust/' + data._id, data);
    },
    disapproveCustomer: function(data) {
      return $http.put('/api/v1/disapprovecust/' + data._id, data);
    },
    verifyCustomer: function(data) {
      return $http.put('/api/v1/verifycust/' + data._id, data);
    },
    deactiveShop: function(data) {
      return $http.put('/api/v1/deactiveshop/' + data._id, data);
    },
    activateShop: function(data) {
      return $http.put('/api/v1/activateshop/' + data._id, data);
    },
    disapproveShop: function(data) {
      return $http.put('/api/v1/disapproveshop/' + data._id, data);
    },
    verifyShop: function(data) {
      return $http.put('/api/v1/verifyshop/' + data._id, data);
    },
    deactiveBarber: function(data) {
      return $http.put('/api/v1/deactivebarber/' + data._id, data);
    },
    disapproveBarber: function(data) {
      return $http.put('/api/v1/disapprovebarber/' + data._id, data);
    },
    activateBarber: function(data) {
      return $http.put('/api/v1/activatebarber/' + data._id, data);
    },
    verifyBarber: function(data) {
      return $http.put('/api/v1/verifybarber/' + data._id, data);
    },
    updateBarber: function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v1/account',
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
    updateShop: function(data) {
      console.log(data)
      return $http({
        method: 'PUT',
        url: '/api/v1/account',
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
      return $http.put('/api/v1/shops', data);
    },
    addChair: function(data) {
      return $http.post('/api/v1/shops/chair', data);
    },
    deleteChair: function(data) {
      return $http({
        method: 'DELETE',
        url: '/api/v1/shops/chair',
        data: data,
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        }
      });
    },
    markChairBooked: function(data, id) {
      return $http({
        method: 'PUT',
        url: '/api/v1/shops/markchairasbooked/' + data._id,
        headers: {
          'user_id': id,
          'chair_id': data._id
        }
      });
    },
    postChair: function(data, id) {
      return $http({
        method: 'PUT',
        url: '/api/v1/shops/postchairtoallbarbers',
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
        url: '/api/v1/shops/managechair',
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
      return $http.put('/api/v1/deletebarber/' + data._id, data);
    },
    undeleteBarber: function(data) {
      return $http.put('/api/v1/undeletebarber/' + data._id, data);
    },
    deleteShop: function(data) {
      return $http.put('/api/v1/deleteshop/' + data._id, data);
    },
    undeleteShop: function(data) {
      return $http.put('/api/v1/undeleteshop/' + data._id, data);
    },
    deleteCustomer: function(data) {
      return $http.put('/api/v1/deletecustomer/' + data._id, data);
    },
    undeleteCustomer: function(data) {
      return $http.put('/api/v1/undeletecustomer/' + data._id, data);
    },
    barberList: function(data) {
      return $http.get('/api/v1/shops/barbers/' + data._id, data);
    },
    addCustomer: function(cust) {
      console.log(cust)
      return $http.post('/api/v1/signup', cust);
    },
    countBarber: function(data) {
      return $http.get('/api/v1/countbarber', data);
    },
    countShop: function(data) {
      return $http.get('/api/v1/countshop', data);
    },
    countCustomer: function(data) {
      return $http.get('/api/v1/countcustomer', data);
    },
    countAppointment: function(data) {
      return $http.get('/api/v1/countappoint', data);
    },
    featuringPlans: function(data) {
      return $http.get('/api/v1/stripe/plans', data);
    },
    createPlan:function (data) {
      return $http.post('/api/v1/stripe/createPlan', data)
    },
    updatePlan:function (data) {
      return $http.put('/api/v1/stripe/updatePlan', data)
    },
    deletePlan:function (data) {
      return $http.put('/api/v1/stripe/deletePlan', data)
    },
    allPayments:function (data) {
      return $http.get('/api/v1/allPayments', data);
    }
  };
});