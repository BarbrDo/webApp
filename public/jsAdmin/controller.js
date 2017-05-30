app_admin.controller('swiftec_admin_controller', function($scope, $http, $log, $timeout, ModalService, $uibModal, $rootScope ) {

    /* sidebar */

    $scope.toggleleftclass= false;

     $scope.togglebodyclass= function(){
         $scope.toggleleftclass= ! $scope.toggleleftclass;
     }

	/* company list */

	$http({
      method: "GET",
      url: 'json/companylist.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.companylist = response.data.company_list;
  });

  $scope.removecompany = function(item){
    var index = $scope.companylist.indexOf(item);
    $scope.companylist.splice(index, 1);
  }   


/* add memeber page */

  $scope.tagitem= [
    {
      name: 'Greater Melbourn, Victoria'
    },
    {
      name: 'Sydeny, Victoria'
    },
    {
      name: 'Greater Melbourn, Victoria'
    },
    {
      name: 'Sydeny, Victoria'
    }
  ];

  

  $scope.addTags = function (input_site) {

     

    if (typeof (input_site) != 'undefined' && input_site != ''){ 
      $scope.tagitem.push({ name: input_site  }); 
      input_site = ''; 
       
    }else { 
      alert('Please enter the site name'); 
    }

  }
  
  $scope.removesite = function(item){
    var index = $scope.tagitem.indexOf(item);
    $scope.tagitem.splice(index, 1);
  }
  
  /* member list page */
  
  $http({
      method: "GET",
      url: 'json/member-list.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.memberlist = response.data.member_list;
  });

  $scope.removemember = function(item){
    var index = $scope.memberlist.indexOf(item);
    $scope.memberlist.splice(index, 1);
  }   


/* all site page */

$http({
      method: "GET",
      url: 'json/all-site.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.sitelist = response.data.site_list;
  });

$scope.statusval = function(value) {
	
	if (value == 'pending' || value == 'Pending') {
		var textcolor = 'text-brown';
		return textcolor
	}
	if (value == 'approved' || value == 'Approved') {
		var textcolor = 'text-green';
		return textcolor;
	}
	if (value == 'installed' || value == 'Installed') {
		var textcolor = 'text-blue';
		return textcolor;
	}
	if (value == 'rejected' || value == 'Rejected') {
		var textcolor = 'text-red';
		return textcolor;
	}
	
}

 /* plan list page */
  
  $http({
      method: "GET",
      url: 'json/planlist.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.planlist = response.data.planlist;
  });

  $scope.removemember = function(item){
    var index = $scope.planlist.indexOf(item);
    $scope.memberlist.splice(index, 1);
  }
  
  
   /* service list page */
  
  $http({
      method: "GET",
      url: 'json/servicelist.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.service_list = response.data.servicelist;
  });

  $scope.removemember = function(item){
    var index = $scope.service_list.indexOf(item);
    $scope.memberlist.splice(index, 1);
  }

 

   /* Task library page */
  
  $http({
      method: "GET",
      url: 'json/tasklibrary.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.task_list = response.data.tasklist;
  });

  $scope.removemember = function(item){
    var index = $scope.service_list.indexOf(item);
    $scope.memberlist.splice(index, 1);
  }
  
  /* beacon list */
  
    $http({
      method: "GET",
      url: 'json/beaconlist.json',
      contentType: "application/json; ",
      dataType: "json",

  }).then(function(response) {
      $scope.beaconlist = response.data.beacon_list;
  });

  $scope.removebeacon = function(item){
    var index = $scope.beaconlist.indexOf(item);
    $scope.beaconlist.splice(index, 1);
  }
  
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

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

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };
  
  $scope.open3 = function() {
    $scope.popup3.opened = true;
  };

  $scope.open4 = function() {
    $scope.popup4.opened = true;
  };
  
  $scope.open5 = function() {
    $scope.popup5.opened = true;
  };

  $scope.open6 = function() {
    $scope.popup6.opened = true;
  };
  
  $scope.open7 = function() {
    $scope.popup7.opened = true;
  };

  $scope.open8 = function() {
    $scope.popup8.opened = true;
  };
  
  $scope.open9 = function() {
    $scope.popup9.opened = true;
  };

  $scope.open10 = function() {
    $scope.popup10.opened = true;
  };
  $scope.open11 = function() {
    $scope.popup11.opened = true;
  };

  $scope.open12 = function() {
    $scope.popup12.opened = true;
  };
  
  $scope.open13 = function() {
    $scope.popup13.opened = true;
  };

  $scope.open14 = function() {
    $scope.popup14.opened = true;
  };
  
  $scope.open15 = function() {
    $scope.popup15.opened = true;
  };

  $scope.open16 = function() {
    $scope.popup16.opened = true;
  };
  
  $scope.open17 = function() {
    $scope.popup17.opened = true;
  };

  $scope.open18 = function() {
    $scope.popup18.opened = true;
  };
  
  $scope.open19 = function() {
    $scope.popup19.opened = true;
  };

  $scope.open20 = function() {
    $scope.popup20.opened = true;
  };


  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };
 
  
  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };
  
  $scope.popup3 = {
    opened: false
  };

  $scope.popup4 = {
    opened: false
  };
  
  $scope.popup5 = {
    opened: false
  };

  $scope.popup6 = {
    opened: false
  };
  
  $scope.popup7 = {
    opened: false
  };

  $scope.popup8 = {
    opened: false
  };
  
  $scope.popup9 = {
    opened: false
  };

  $scope.popup10 = {
    opened: false
  };
  
   $scope.popup11 = {
    opened: false
  };

  $scope.popup12 = {
    opened: false
  };
  
  $scope.popup13 = {
    opened: false
  };

  $scope.popup14 = {
    opened: false
  };
   $scope.popup15 = {
    opened: false
  };

  $scope.popup16 = {
    opened: false
  };
  
  $scope.popup17 = {
    opened: false
  };

  $scope.popup18 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

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


  
  /*modal pop up*/
  $scope.show = function() {
  ModalService.showModal({
    templateUrl: 'modals/add-plan-modal.html',
    controller: "ModalController"
  }).then(function(modal) {
    modal.element.modal();
    modal.close.then(function(result) {
      $scope.message = "You said " + result;
    });
    
  });
};

$scope.showmodal2 = function() {
  ModalService.showModal({
    templateUrl: 'modals/add-service-modal.html',
    controller: "ModalController"
  }).then(function(modal) {
    modal.element.modal();
    modal.close.then(function(result) {
      $scope.message = "You said " + result;
    });
    
  });
};

$scope.showmodal3 = function() {
  ModalService.showModal({
    templateUrl: 'modals/view-service.html',
    controller: "ModalController"
  }).then(function(modal) {
    modal.element.modal();
    modal.close.then(function(result) {
      $scope.message = "You said " + result;
    });
    
  });
};

//add task
$scope.showmodal4 = function() {
  ModalService.showModal({
    templateUrl: 'modals/add_task.html',
    controller: "ModalController"
  }).then(function(modal) {
    modal.element.modal();
    modal.close.then(function(result) {
      $scope.message = "You said " + result;
    });
    
  });
};
//add task

 $scope.labels = ["2010", "2011", "2012", "2013", "2014", "2017", "2016"];
  $scope.series = ['Beacons', 'Companies', 'Total Tasks'];
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

app_admin.controller('ModalController', function($scope, close, $uibModal) {
  
 $scope.close = function(result) {
 	close(result, 500); // close, but give 500ms for bootstrap to animate
 };
 
   //Minimal slider config
  $scope.slider = {
    value: 80,

	 options: {
      showSelectionBar: true,
      floor: 0,
        ceil: 100,
        step: 5,
    }
  };
  
  /* sub service */

  $scope.subservice_tag= [
    {
      name: 'Greater Melbourn, Victoria'
    },
    {
      name: 'Sydeny, Victoria'
    },
    {
      name: 'Greater Melbourn, Victoria'
    },
    {
      name: 'Sydeny, Victoria'
    }
  ];
  
    $scope.add_subservice = function (input_service) {

     

    if (typeof (input_site) != 'undefined' && input_site != ''){ 
      $scope.subservice_tag.push({ name: input_service  }); 
      input_service = ''; 
       
    }else { 
      alert('Please enter the site name'); 
    }

  }
  
  $scope.removesub_service = function(item){
    var index = $scope.subservice_tag.indexOf(item);
    $scope.tagitem.splice(index, 1);
  }


});