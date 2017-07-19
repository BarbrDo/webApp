angular.module('BarbrDoApp')
  .factory('barber', function($http,$window) {
    var obj = JSON.parse($window.localStorage.user);
    return {
       appointments: function(data) {
        return $http({
          method: 'GET',
          url: '/api/v1/barber/appointments',
          headers: {
            'user_id': obj._id
          }
        },data);
      },
      appointment: function(data) {
        return $http.get('/api/v1/barber/particularAppointment/'+data._id, data);
      },
      shopsHavingChairs: function(data) {
         return $http({
          method: 'GET',
          url: '/api/v1/barber/shops/chair',
          params: {search:data.search},
          headers: {
            'device_latitude': data.latitude,
            'device_longitude': data.longitude
          }
        });
      },
      shopChairs: function(data) {
        return $http({
          method: 'get',
          url: '/api/v1/shopdetail/'+data._id,
          headers: {
            'user_id': data._id
          }
        });
      },
      requestChair: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/barber/requestchair',
          data:data,
          headers: {
            'user_id': obj._id
          }
        });
      },
      confirmAppointment: function(data) {
        return $http.put('/api/v1/barber/confirmappointment/'+data.appointment_id, data);
      },
      completeAppointment: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/barber/completeappointment/'+data.appointment_id,
          headers: {
            'user_id': obj._id
          },
          data:data
        });
      },
      reschedule: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/barber/rescheduleappointment/'+data.appointment_id,
          data:data
        },data);
      },
      cancelAppoint: function(data) {
        return $http.put('/api/v1/barber/cancelappointment/'+data.appointment_id, data);
      },
      manageRequest: function() {
        return $http.get('/api/v1/barber/shopchairrequests/'+obj._id);
      },
      RequesterDetail: function(data) {
        return $http.get('/api/v1/shopdetail/' + data, data);
      },
      acceptRequest: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/acceptrequest',
          data:{
            chair_request_id: data._id,
            request_type: 'accept'
          },
          headers: {
            'user_id' : obj._id
          }
        });
      },
      declineRequest: function(data) {
        return $http({
          method: 'put',
          url: '/api/v1/shops/acceptrequest',
          data:{
            chair_request_id: data._id,
            request_type: 'decline'
          },
          headers: {
            'user_id' : obj._id
          }
        });
      },
      addService: function(data) {
        return $http({
          method: 'post',
          url: '/api/v1/barber/services',
          headers: {
            'user_id' : obj._id
          },
          data : data
        })
      },
      editService: function(data) {
         return $http({
          method: 'put',
          url: '/api/v1/barber/services/'+data.service_id,
          headers: {
            'user_id' : obj._id
          },
          data : data
        })
      },
      deleteService: function(data) {
         return $http({
          method: 'delete',
          url: '/api/v1/barber/services/'+data._id,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            'user_id' : obj._id
          }
        })
      },
      allServices: function(data) {
        return $http.get('/api/v1/barber/services');
      },
      barberServices: function(data) {
        return $http.get('/api/v1/barber/services/'+obj._id);
      },
      finacialCenter: function(data) {
        return $http({
          method: 'get',
           url: '/api/v1/barber/sale/'+data.startdate+'/'+data.enddate,
          headers: {
            'user_id': obj._id
          }
        });
      }
      }
  });