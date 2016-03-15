var myCalendarApp = angular.module('myCalendarApp', ['ui.calendar']);

myCalendarApp.controller('CalendarCtrl',function($scope,$q,$http,$timeout) {


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

    $scope.events = [];
    $scope.eventSources = [$scope.events];

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
                    console.info('drop') ;

                },

                eventReceive: function(event,view){
                    console.info('eventReceive') ;
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

                //删除一个事件触发的动作
                eventClick:function(event, jsEvent, view){
                    console.info('---eventClick---');
                    if (confirm("您确定要删除这个排班吗？")) {
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

                        changeStatus = 'remove';
                        changeStart = event.start.format();
                        changeShiftId = event.shiftId;

                        var logData = {};
                        logData = {
                            'employee_id': changeEmployee_id,
                            'status': changeStatus,
                            'start': changeStart,
                            'shiftId': changeShiftId
                        };
                        changeData.push(logData);
                        angular.element('.coolcalendar').fullCalendar('removeEvents', event._id);
                    }
                },

                eventRender: function(event, element, view){



                    console.info('eventRender') ;
                },


                eventAfterRender: function(event, element, view){
                    console.info('eventAfterRender') ;
                },

                eventAfterAllRender: function(view){

                    console.info('eventAfterAllRender') ;
                    afterAllRenderTimes = afterAllRenderTimes + 1;
                    if (afterAllRenderTimes == $scope.employee_list.length) {
                        console.info('get in !');
                        $timeout(function () { $scope.assignmentsLoaded($scope.uiConfig); }, 1000);
                    };
                    $scope.head = view.title;
                }
            }
    };







    $scope.prev = function(){

        angular.element('.coolcalendar').fullCalendar('prev');
    };

    $scope.next = function(){

        angular.element('.coolcalendar').fullCalendar('next');
    };


    $scope.submit2 = function(){

        console.info('---changeData---');

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
    $scope.init();


    console.info('---After init---');


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

