angular.module('BarbrDoApp')
    .controller('eventShopCtrl', function($scope, $stateParams, $state, customer, toastr, moment, alert, $uibModal, $compile, uiCalendarConfig, $filter,$window) {
       var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var obj = JSON.parse($window.localStorage.user);
    $scope.events = [];
    customer.barberInfo(obj).then(function(response){
      $scope.shop_chairs = [];
      for(var i=0;i<response.data.user.shop[0].chairs.length;i++){
        if(response.data.user.shop[0].chairs[i].barber_id){
          $scope.shop_chairs.push(response.data.user.shop[0].chairs[i]);
        }
      }
      if($scope.shop_chairs.length>0){
         $scope.selectValue = $scope.shop_chairs[0];
         $scope.getBarberEvent()
      }
      else{
        toastr.warning("You don't have any barber.");
      }
    })
    $scope.getBarberEvent = function  () {
      if($scope.selectValue){
          let obj = {
            "barber_id":$scope.selectValue.barber_id,
            "date":$scope.currentDate
          }
          customer.getShopEvents(obj).then(function(response){
            for (var i = 0; i < response.data.data.events.length; i++) {
                let obj = {
                    title: response.data.data.events[i].title,
                    start:moment.parseZone(response.data.data.events[i].startsAt).format("llll"),
                    end:moment.parseZone(response.data.data.events[i].endsAt).format("llll"),
                    id: response.data.data.events[i]._id
                }
                $scope.events.push(obj)
            }
          })
      }
      else{
      }
    }

    // $scope.events = [
    //   {title: 'Lunch',start:moment.parseZone("2017-07-20T12:30:08.297Z").format("llll"),end: moment.parseZone("2017-07-20T13:30:08.297Z").format("llll")}
    // ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };

  
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
   
   
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    /* Change View */
    $scope.renderCalender = function(calendar) {
      if(uiCalendarConfig.calendars[calendar]){
        uiCalendarConfig.calendars[calendar].fullCalendar('render');
      }
    };
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) { 
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        defaultView: 'agendaDay',
         header:{
          left: '',
          center: 'title',
          right: 'today prev,next'
        },
        viewRender: function(view, element) {
          $scope.currentDate = view.start
          $scope.getBarberEvent();
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

    
    /* event sources array*/
    $scope.eventSources2 = [$scope.events];

    })