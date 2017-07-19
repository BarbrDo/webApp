angular.module('BarbrDoApp')
  .factory('Contact', function($http) {
    return {
      send: function(data) {
        return $http.post('/api/v1/contact', data);
      }
    };
  });