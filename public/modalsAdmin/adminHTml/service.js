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
      shopDetail: function(data) {
      return $http.get('/api/v1/shopdetail/'+data._id, data);
      },
       viewShopDetail: function(data) {
      return $http.get('/api/v1/viewshopdetail/'+data.user_id, data);
      },
      updateCustomer: function(data) {
        console.log("data",data);
         return $http({
          method: 'PUT',
          url: '/api/v1/account',
          headers: {
            'user_id':data._id
          },
          data: data
        });
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
      deactiveShop: function(data) {
      return $http.put('/api/v1/deactiveshop/'+data._id, data);
      },
       activateShop: function(data) {
      return $http.put('/api/v1/activateshop/'+data._id, data);
      },
       disapproveShop: function(data) {
      return $http.put('/api/v1/disapproveshop/'+data._id, data);
      },
       verifyShop: function(data) {
      return $http.put('/api/v1/verifyshop/'+data._id, data);
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
        console.log("data",data);
         return $http({
          method: 'PUT',
          url: '/api/v1/account',
          headers: {
            'user_id':data._id
          },
          data: data
        });
      },      
      updateShop: function(data) {
        console.log("data",data);
         return $http({
          method: 'PUT',
          url: '/api/v1/account',
          headers: {
            'user_id':data._id
          },
          data: data
        });
      },
      addChair: function(data) {
        return $http.post('/api/v1/shops/chair',data);
      },
      deleteChair: function(data) {
        console.log("data",data);
        return $http({
          method: 'DELETE',
          url: '/api/v1/shops/chair',
          headers: {
            'user_id':data._id
          },
          data: data
        });
        return $http.delete('',data);
      },
      deleteBarber: function(data) {
      return $http.put('/api/v1/deletebarber/'+data._id, data);
      },
      undeleteBarber: function(data) {
      return $http.put('/api/v1/undeletebarber/'+data._id, data);
      },
      deleteShop: function(data) {
      return $http.put('/api/v1/deleteshop/'+data._id, data);
      },
      undeleteShop: function(data) {
      return $http.put('/api/v1/undeleteshop/'+data._id, data);
      },
      deleteCustomer: function(data) {
      return $http.put('/api/v1/deletecustomer/'+data._id, data);
      },
      undeleteCustomer: function(data) {
      return $http.put('/api/v1/undeletecustomer/'+data._id, data);
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