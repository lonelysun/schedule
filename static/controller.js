var myCalendarApp = angular.module('myCalendarApp', ['ui.calendar']);

myCalendarApp.controller('CalendarCtrl',function($scope,$q,$http,$timeout,$compile) {


    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    var param = function(obj) {
		var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

		for(name in obj) {

		  value = obj[name];
		  if(value instanceof Array) {
			for(i=0; i<value.length; ++i) {
			  subValue = value[i];
			  fullSubName = name + '[' + i + ']';
			  innerObj = {};
			  innerObj[fullSubName] = subValue;
			  query += param(innerObj) + '&';
			}
		  }
		  else if(value instanceof Object) {
			for(subName in value) {
			  subValue = value[subName];
			  fullSubName = name + '[' + subName + ']';
			  innerObj = {};
			  innerObj[fullSubName] = subValue;
			  query += param(innerObj) + '&';
			}
		  }
		  else if(value !== undefined && value !== null)
			query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
		}

		return query.length ? query.substr(0, query.length - 1) : query;
	  };
    $http.defaults.transformRequest = [function(data) {
		return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	  }];


    var changeData = [];
    var changeEmployee_id,
        changeStatus,
        changeStart,
        changeShiftId,
        afterAllRenderTimes;
    afterAllRenderTimes = 0;
    var weekStart = null;
    var weekEnd = null;

    $scope.events = [];
    $scope.eventSources = [$scope.events];
    $scope.dayList = []



    $scope.init = function(){

        //获取数据
        $http.get('/calendar/fullcalendar/angular/data').success(function(data) {

            $scope.employee_list = data['employee_list'];
            $scope.shift_list = data['shift_list'];
            $scope.eventSource_list = data['eventSource_list'];
        });


        //初始化calendar
        $scope.uiConfig = {
            calendar : {
                defaultView: 'basicWeek',
                firstDay: 1,
                height: 100,
                header: false,
                droppable: true,
                columnFormat: ' ',
                titleFormat: 'YYYY年MM月D日',
                eventOverlap: function(stillEvent, movingEvent) {
                    if(stillEvent.title == movingEvent.title){
                        return false;
                    }else{
                        return true;
                    }
                },

                //增加一个事件触发的动作
                drop: function (date, jsEvent, ui ,view){

                },

                eventReceive: function(event,view){
                    //console.info($(this).id);


                    changeStart = event.start.format();
                    changeShiftId = event.shiftId;
                    changeStatus = 'add';

                    //找出drop到的calendar Id
                    outerloop:
                    for(var i =0;i<$scope.employee_list.length;i++){
                        var employee_id = ($scope.employee_list[i])['id']

                        var arrayOfObject = angular.element('#calendar_'+employee_id).fullCalendar('clientEvents');
                        for (var j=0; j<arrayOfObject.length;j++){
                            if (arrayOfObject[j]._id == event._id){
                                changeEmployee_id = employee_id;
                                break outerloop;

                            }
                        }
                    }

                    var logData = {};
                    logData = {
                        'employee_id': changeEmployee_id,
                        'status': changeStatus,
                        'start': changeStart,
                        'shiftId': changeShiftId
                    };

                    changeData.push(logData);
                },

                eventMouseover: function( event, jsEvent, view ){
                    //angular.element('#calendar_'+employee_id).fullCalendar('clientEvents');

                    //$(this).css('background-color','green');
                    //
                    ////var objDiv = $('.hideDiv')
                    //
                    //$(".hideDiv").css("display","block");
                    var deleteEventId = event._id;
                    var deleteEventStart = event.start.format();
                    var deleteEventShiftId =event.shiftId;

                    $(this).find(">:first-child").append('<a class="delete" style="float:right" ng-click="RemoveEvent(\''+deleteEventId+'\',\''+deleteEventStart+'\',\''+deleteEventShiftId+'\')"><span style="color:black" class="glyphicon glyphicon-remove"></span></a>');
                    //$(this).find(">:first-child").append('<a class="delete" style="float:right" ng-click="eventClick(\''+deleteEventId+'\')"><span style="color:black" class="glyphicon glyphicon-remove"></span></a>');
                    //$(this).find(">:first-child").append("<button class='delete' style='float:right' ng-click='RemoveEvent(deleteEventId)'>Test</button>");
                    //$(this).find(">:first-child").append("<button class='delete' style='float:right' onclick='removeE()'>Test</button>");
                    $compile($('.delete'))($scope);

                },

                eventMouseout: function( event, jsEvent, view ){
                    //console.info(event);
                    //angular.element('#calendar_'+employee_id).fullCalendar('clientEvents');

                    //$(this).css('background-color','green');
                    //
                    ////var objDiv = $('.hideDiv')
                    //
                    //$(".hideDiv").css("display","block");

                    $( ".delete" ).remove();
                    //$(this).find(">:first-child").("<span class='delete' style='float:right'>Test</span>");

                },




                ////删除一个事件触发的动作
                //eventClick:function(event, jsEvent, view){
                //    console.info('---eventClick---');
                //    if (confirm("您确定要删除这个排班吗？")) {
                //        outerloop:
                //        for(var i =0;i<$scope.employee_list.length;i++){
                //            var employee_id = ($scope.employee_list[i])['id']
                //
                //            var arrayOfObject = angular.element('#calendar_'+employee_id).fullCalendar('clientEvents');
                //            for (var j=0; j<arrayOfObject.length;j++){
                //                if (arrayOfObject[j]._id == event._id){
                //                    changeEmployee_id = employee_id;
                //                    break outerloop;
                //
                //                }
                //            }
                //        }
                //
                //        changeStatus = 'remove';
                //        changeStart = event.start.format();
                //        changeShiftId = event.shiftId;
                //
                //        var logData = {};
                //        logData = {
                //            'employee_id': changeEmployee_id,
                //            'status': changeStatus,
                //            'start': changeStart,
                //            'shiftId': changeShiftId
                //        };
                //        changeData.push(logData);
                //        angular.element('.coolcalendar').fullCalendar('removeEvents', event._id);
                //    }
                //},

                eventRender: function(event, element, view){


                },


                eventAfterRender: function(event, element, view){
                },

                eventAfterAllRender: function(view){

                    afterAllRenderTimes = afterAllRenderTimes + 1;
                    if (afterAllRenderTimes == $scope.employee_list.length) {
                        $timeout(function () { $scope.assignmentsLoaded($scope.uiConfig); }, 1000);
                    };
                    $scope.head = view.title;

                    weekStart = view.start.format().slice(5,10);
                    weekEnd = view.end.format().slice(5,10);


                    $scope.dayList = []
                    var nameOfDayArray = ['周一','周二','周三','周四','周五','周六','周日']

                    if( weekStart.slice(0,2) == weekEnd.slice(0,2) ){
                        var dayBase = parseInt(weekStart.slice(3));
                        var monthBase = weekStart.slice(0,2);

                        for(var i=0;i<7;i++){
                            var day={'name':nameOfDayArray[i],
                                        'date': monthBase + '-' + (dayBase + i).toString()};
                            $scope.dayList.push(day);

                        }

                        //$scope.dateOfMon = monthBase + '-' + (dayBase).toString();
                        //$scope.dateOfTue = monthBase + '-' + (dayBase + 1).toString();
                        //$scope.dateOfWed = monthBase + '-' + (dayBase + 2).toString();
                        //$scope.dateOfThu = monthBase + '-' + (dayBase + 3).toString();
                        //$scope.dateOfFri = monthBase + '-' + (dayBase + 4).toString();
                        //$scope.dateOfSat = monthBase + '-' + (dayBase + 5).toString();
                        //$scope.dateOfSun = monthBase + '-' + (dayBase + 6).toString();


                    }
                    else{
                        var endDayBase = parseInt(weekEnd.slice(3));
                        var endMonthBase = weekEnd.slice(0,2);

                        var startDayBase = parseInt(weekStart.slice(3));
                        var startMonthBase =  weekStart.slice(0,2);

                        for(var i=0;i<(7-dayBase);i++){
                            var day={'name':nameOfDayArray[i],
                                        'date': startMonthBase + '-' + (startDayBase + i).toString()};
                            $scope.dayList.push(day);

                        }

                        //!!Here Need Another loop
                        //for(var i=7-dayBase;i<7;i++){
                        //     var day={'name':nameOfDayArray[i],
                        //                'date': endMonthBase + '-' + (dayBase - (7-dayBase)).toString()};
                        //    $scope.dayList.push(day);
                        //
                        //}
                    }

                },


            }
    };







    $scope.prev = function(){

        angular.element('.coolcalendar').fullCalendar('prev');
    };

    $scope.next = function(){

        angular.element('.coolcalendar').fullCalendar('next');
    };

    $scope.submit2 = function(){

        var toJsonData = {
            'data':angular.toJson(changeData)
        };
        $http.post('/calendar/fullcalendar/angular/submit2',toJsonData).success(function(data) {
        });
        changeData = [];
    };

    };


    $scope.assignmentsLoaded = function (data,status) {
        $scope.assignments = data;

    };

    $scope.RemoveEvent = function(deleteEventId,deleteEventStart,deleteEventShiftId){


        outerloop:
        for(var i =0;i<$scope.employee_list.length;i++){
            var employee_id = ($scope.employee_list[i])['id']

            var arrayOfObject = angular.element('#calendar_'+employee_id).fullCalendar('clientEvents');
            for (var j=0; j<arrayOfObject.length;j++){
                if (arrayOfObject[j]._id == deleteEventId){
                    changeEmployee_id = employee_id;
                    break outerloop;

                }
            }
        }

        changeStatus = 'remove';
        changeStart = deleteEventStart;
        changeShiftId = deleteEventShiftId;

        var logData = {};
        logData = {
            'employee_id': changeEmployee_id,
            'status': changeStatus,
            'start': changeStart,
            'shiftId': changeShiftId
        };
        changeData.push(logData);

        angular.element('.coolcalendar').fullCalendar('removeEvents', deleteEventId);
    };


    $scope.init();

});



myCalendarApp.directive('nisenD',['$timeout',function($scope,$timeout){
    return function($scope, element, attrs) {
        if ($scope.$last){
            $('#external-events .fc-event').draggable({
                zIndex: 999,
                revert: true,      // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
            });



            //docs = document;
        }
      };

}]);


myCalendarApp.directive('nisenC',['$timeout',function($scope,$timeout){
    return function($scope, element, attrs) {
        if ($scope.$last){
            $('#external-events .fc-event').draggable({
                zIndex: 999,
                revert: true,      // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
            });

        }
      };

}]);

myCalendarApp.directive('nisenI',['$timeout',function($scope,$timeout){
    return function ($scope, element, attrs) {
        $scope.$watch("assignments", function (value) {
            var val = value || null;
            if (val){

                $scope.eventSource_list;

                for(var i =0;i<$scope.eventSource_list.length;i++){

                    var employeeId = $scope.eventSource_list[i]['employeeId'];
                    var source = $scope.eventSource_list[i]['eventSource'];

                    angular.element('#calendar_'+employeeId).fullCalendar( 'addEventSource', source);
                }
            }
        });
    };

}]);



removeE = function (){

}


