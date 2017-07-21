angular.module('BarbrDoApp')
    .controller('EventCtrl', function($scope, $stateParams, $state, customer, toastr, moment, alert, $uibModal, $compile, uiCalendarConfig, $filter) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        var vm = this;
        console.log("running");
        var addOffset = function(dobFormat) {
            var userOffset = new Date(dobFormat).getTimezoneOffset();
            var userOffsetMilli = userOffset * 60 * 1000;
            var dateInMilli = moment(dobFormat).unix() * 1000;
            var dateInUtc = dateInMilli + userOffsetMilli;
            var currentDate = new Date(dateInUtc)
            return currentDate;
        }



        $scope.changeTo = 'Hungarian';
        //These variables MUST be set as a minimum for the calendar to work
        vm.calendarView = 'month';
        vm.viewDate = new Date();
        $scope.events = [];

        $scope.getBarberEvent = function() {
            console.log($scope.currentDate);
            let obj = {
                date: moment($scope.currentDate).format("YYYY-MM-DD")
            }
            console.log(obj)
            customer.getEvents(obj).then(function(response) {
                console.log(JSON.stringify(response.data.data.events));
                for (var i = 0; i < response.data.data.events.length; i++) {
                    console.log(response.data.data.events[i].startsAt, response.data.data.events[i].endsAt)
                    console.log("value of i", i);
                    let obj = {
                        title: response.data.data.events[i].title,
                        start: moment.parseZone(response.data.data.events[i].startsAt).format("llll"),
                        end: moment.parseZone(response.data.data.events[i].endsAt).format("llll"),
                        id: response.data.data.events[i]._id
                    }
                    $scope.events.push(obj)
                    console.log(JSON.stringify($scope.events));
                }
            });
        }
        $scope.eventsF = function(start, end, timezone, callback) {
            var s = new Date(start).getTime() / 1000;
            var e = new Date(end).getTime() / 1000;
            var m = new Date(start).getMonth();
            var events = [{
                title: 'Feed Me ' + m,
                start: s + (50000),
                end: s + (100000),
                allDay: false,
                className: ['customFeed']
            }];
            callback(events);
        };

        /* remove event */
        $scope.remove = function(index) {
            $scope.events.splice(index, 1);
        };
        /* Change View */
        $scope.changeView = function(view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalender = function(calendar) {
            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        };
        /* Render Tooltip */
        $scope.eventRender = function(event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };
        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                defaultView: 'agendaDay',
                header: {
                    left: '',
                    center: 'title',
                    right: 'today prev,next'
                },
                viewRender: function(view, element) {
                    $scope.currentDate = view.start
                    $scope.getBarberEvent()
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            }
        };


        /* event sources array*/
        $scope.eventSources = [$scope.events];

        $scope.addEvents = function() {
            var modalInstance = $uibModal.open({
                // animation: $scope.animationsEnabled,
                templateUrl: 'mymodel.html',
                controller: 'popupCtrl',
                scope: $scope,
                size: 'Lg',
                windowClass: 'modal-custom-content',
                resolve: {}
            });
        };

        var myArray = [];
        var date = new Date();
        var ddate = new Date();

        $scope.startdate = $filter('date')(ddate, "yyyy-MM-dd");
        $scope.endDate = $filter('date')(ddate, "yyyy-MM-dd");

        var max = new Date(2020, 5, 22);

        $scope.maxDate = max;
        var min = new Date();
        $scope.minDate = min;

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };
        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

        $scope.formats = ['yyyy-MM-dd'];
        $scope.format = $scope.formats[0];

        $scope.popup1 = {
            opened: false
        };
        $scope.popup2 = {
            opened: false
        };

    })

.controller("popupCtrl", ['$scope', '$state', '$stateParams', '$uibModalInstance', '$window', '$timeout', 'toastr', '$filter', 'customer', function($scope, $state, $stateParams, $uibModalInstance, $window, $timeout, toastr, $filter, customer) {
    $scope.appointment = {};
    $scope.customer = [];
    //alert("popupCtrl")
    $scope.rep = {};
    $scope.close = function() {
        $uibModalInstance.close();
    };
    $scope.saveAppointment = function(appointment, apptTime) {
        var aptment = appointment;
        var customer = JSON.parse(aptment.ddlCustomer);
        var date = new Date(aptment.apptDate);
        console.log(aptment);
        console.log(customer);
        console.log(date);

    };
    $scope.saveEvent = function() {
        console.log("evengt save");

        var startDate = $filter('date')($scope.startdate, "yyyy-MM-dd");
        var endDate = $filter('date')($scope.endDate, "yyyy-MM-dd");

        var startHourTime = $scope.startTime.getHours();
        var startMintTime = $scope.startTime.getMinutes();
        var endHourTime = $scope.endTime.getHours();
        var endMintTime = $scope.endTime.getMinutes();

        console.log(startHourTime, startMintTime);
        console.log(endHourTime, endMintTime);
        console.log($scope.titleOfEvent);

        startDate = startDate + " " + startHourTime + ":" + startMintTime + ":" + "00";
        endDate = endDate + " " + endHourTime + ":" + endMintTime + ":" + "00";

        console.log(startDate, endDate);
        console.log($scope.rep);
        var size = Object.keys($scope.rep).length;
        console.log(size)
        var myarr = [];
        if (size != 0) {
            for (var key in $scope.rep) {
                if ($scope.rep.hasOwnProperty(key)) {
                    console.log(key + " -> " + $scope.rep[key]);
                    if (key == 'sun') {
                        myarr.push('7');
                    } else if (key == 'mon') {
                        myarr.push('1');
                    } else if (key == 'tues') {
                        myarr.push('2');
                    } else if (key == 'wed') {
                        myarr.push('3');
                    } else if (key == 'thrus') {
                        myarr.push('4');
                    } else if (key == 'fri') {
                        myarr.push('5');
                    } else if (key == 'sat') {
                        myarr.push('6');
                    }
                }
            }
        }

        let obj = {
            title: $scope.titleOfEvent,
            startsAt: startDate,
            endsAt: endDate,
            repeat: myarr
        }

        customer.createEvent(obj).then(function(response) {});
    }

}])