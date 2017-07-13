angular.module('BarbrDoApp')
  .factory('customer', function($http,$window) {
    var obj = JSON.parse($window.localStorage.user);
    return {
      shopList: function(data) {
          console.log("data",data)
        return $http({
          method: 'GET',
          url: '/api/v1/shops',
          params: {search:data.search},
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        });
      },
       barberAll: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/barbers',
          params: {search:data.search},
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);
      },
      barberService: function(data) {
        return $http.get('/api/v1/barber/services/'+data._id, data);
      },
      pendingConfirmation: function(data) {
        return $http.get('/api/v1/appointment/pending/'+data._id, data);
      },
      shopContainsBarbers: function(data) {
        return $http.get('/api/v1/shops/barbers/'+data._id, data);
      },
      bookNowPageInfo: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/shops/barbers/'+data.shop_id+'/'+data.barber_id,
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        },data);
      },
      takeAppointment: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/appointment',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      uploadImages: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/customer/gallery',
          data:data,
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      barbrProfile: function(data) {
        return $http.get('/api/v1/barber/'+data._id, data);
      },
      fetchAppointments: function(data) {
        return $http({
          method: 'get',
          url: '/api/v1/appointment',
          headers: {
            'user_id': obj._id//obj._id
          }
        },data);
      },
      barberInfo: function(data) {
        return $http.get('/api/v1/userprofile/'+data._id, data);
      },
      deleteImage : function(data) {
        return $http({
          method: 'delete',
          url: '/api/v1/barber/gallery/'+ data._id , 
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            'user_id': obj._id//obj._id
          }
        });
      },
      // userProfile : function(data) {
      //   return $http.get('/api/v1/userprofile/'+data);
      // },
      getImages : function(data) {
        return $http.get('/api/v1/userprofile/'+obj._id);
      },
      chargeCustomer:function(data){
        return $http({
          method: 'post',
          url: '/api/v1/stripe/createCharges',
          headers: {
            'user_id': obj._id//obj._id
          },
          data:data,
        },data);
      },
      createEvent:function(data){
        return $http({
          method: 'post',
          url: '/api/v1/barber/event',
          headers: {
            'user_id': obj._id//obj._id
          },
          data:data,
        },data);
      },
      getEvents:function (data) {
        return $http({
          method: 'post',
          url: '/api/v1/barber/event',
          headers: {
            'user_id': obj._id//obj._id
          },
          data:data,
        },data);
      }
    };
  });