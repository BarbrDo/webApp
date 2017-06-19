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
        data: data
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
        data: data
      });
    },
    updateShop: function(data) {
      return $http({
        method: 'PUT',
        url: '/api/v1/account',
        headers: {
          'user_id': data._id
        },
        data: data
      });
    },
    updateShopinfo: function(data) {
      return $http.put('/api/v1/shops', data);
    },
    addChair: function(data) {
      return $http.post('/api/v1/shops/chair', data);
    },
    deleteChair: function(data, id, shopid) {
      return $http({
        method: 'DELETE',
        url: '/api/v1/shops/chair',
        headers: {
          'user_id': id
        },
        data: {
          shop_id: shopid,
          chair_id: data._id
        }
      });
    },
    updateChair: function(data, id) {
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
          amount: data.amount
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
    }

  };
});