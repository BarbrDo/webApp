angular.module('barbrdo')
  .factory('Admin', function($http) {
    return {
      barbers: function(data) {
      return $http.post('/api/v1/allbarbers', data);
      },
      shopsAll: function(data) {
      return $http.post('/api/v1/allshops', data);
      },
      customersAll: function(data) {
      return $http.post('/api/v1/allcustomers', data);
      },
      updateCustomer: function(data) {
      return $http.put('/api/v1/updatecust/'+data._id, data);
      },
      updateBarber: function(data) {
      return $http.put('/api/v1/updatebarber/'+data._id, data);
      },
      updateShop: function(data) {
      return $http.put('/api/v1/updateshop/'+data._id, data);
      },
      deleteShop: function(data) {
      return $http.put('/api/v1/deleteshop/'+data._id, data);
      },
      deleteBarber: function(data) {
      return $http.put('/api/v1/deletebarber/'+data._id, data);
      },
      deleteCustomer: function(data) {
      return $http.put('/api/v1/deletecustomer/'+data._id, data);
      },
      barberList: function(data) {
        return $http.get('/api/v1/shops/barbers/'+data._id, data);
      },
       addBarber: function(data) {
       return $http.post('/api/v1/addbarber', data);
     },
       countBarber: function(data) {
       return $http.get('/api/v1/countbarber', data);
      },
       countShop: function(data) {
       return $http.get('/api/v1/countshop', data);
      },
       countCustomer: function(data) {
       return $http.get('/api/v1/countcustomer', data);
      }
    };
  });