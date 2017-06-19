app_admin.controller('swiftec_admin_controller', function($scope, $http, $log, $timeout, ModalService, $uibModal, $rootScope ) {

    /* sidebar */

    $scope.toggleleftclass= false;

     $scope.togglebodyclass= function(){
         $scope.toggleleftclass= ! $scope.toggleleftclass;
     }

	/* company list */


  $scope.removecompany = function(item){
    var index = $scope.companylist.indexOf(item);
    $scope.companylist.splice(index, 1);
  }   



  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

 


  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }




 $scope.labels = ["2010", "2011", "2012", "2013", "2014", "2017", "2016"];
  $scope.series = ['Barbers', 'Shops', 'Customers'];
  $scope.data = [
    [5, 15, 20, 25, 30, 45, 50],
    [10, 20, 30, 40, 50, 60, 70],
	[30, 60, 90, 120, 150, 180, 210]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };
 

});
