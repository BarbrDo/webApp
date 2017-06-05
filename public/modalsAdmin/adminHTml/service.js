angular.module('barbrdo')
  .factory('Admin', function($http) {
    return {
      barbers: function(data) {
      return $http.post('/api/v1/allbarbers', data);
      },
      shopsAll: function(data) {
      return $http.post('/api/v1/allshops', data);
      },
      shopList: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/shops',
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);

      },
      customersAll: function(data) {
      return $http.post('/api/v1/allcustomers', data);
      },
      updateCustomer: function(data) {
      return $http.put('/api/v1/updatecust/'+data._id, data);
      },
      deactiveCustomer: function(data) {
      return $http.put('/api/v1/deactivecust/'+data._id, data);
      },
       activateCustomer: function(data) {
      return $http.put('/api/v1/activatecust/'+data._id, data);
      },
       disapproveCustomer: function(data) {
      return $http.put('/api/v1/disapprovecust/'+data._id, data);
      },
       verifyCustomer: function(data) {
      return $http.put('/api/v1/verifycust/'+data._id, data);
      },
      deactiveBarber: function(data) {
      return $http.put('/api/v1/deactivebarber/'+data._id, data);
      },
      disapproveBarber: function(data) {
      return $http.put('/api/v1/disapprovebarber/'+data._id, data);
      },
      activateBarber: function(data) {
      return $http.put('/api/v1/activatebarber/'+data._id, data);
      },
      verifyBarber: function(data) {
      return $http.put('/api/v1/verifybarber/'+data._id, data);
      },
      updateBarber: function(data) {
      return $http.put('/api/v1/updatebarber/'+data._id, data);
      },      
      updateShop: function(data) {
       return $http.put('/api/v1/shops',data);
      },
      updateChair: function(data) { 
      return $http.put('/api/v1/updatechair/'+data._id, data);
      },
      addChair: function(data) {
        return $http.post('/api/v1/shops/chair',data);
      },
      deleteChair: function(data) {
        console.log("data",data);
        return $http.delete('/api/v1/shops/chair',data);
      },
      deleteBarber: function(data) {
      return $http.put('/api/v1/deletebarber/'+data._id, data);
      },
      deleteShop: function(data) {
        console.log("data",data);
      return $http.put('/api/v1/deleteshop/'+data._id, data);
      },
      deleteCustomer: function(data) {
      return $http.put('/api/v1/deletecustomer/'+data._id, data);
      },
      barberList: function(data) {
        return $http.get('/api/v1/shops/barbers/'+data._id, data);
      },
      addCustomer: function(cust) {
       return $http.post('/api/v1/signup',cust);
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