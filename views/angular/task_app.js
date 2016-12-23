var app = angular.module('TaskApp', []);
app.controller('TaskController', function($scope, QueryService) {
    $scope.tasks = [];
    $scope.task_description = '';

    QueryService.GetAllUserTasks()
        .success(function(data) {
            console.log(data);
            if (data.success === true) {
                $scope.tasks = data.tasks;
            }
        });

    $scope.AddNewTask = function() {
        if ($scope.task_description) {
            QueryService.AddNewTask($scope.task_description)
                .success(function(data) {
                    $scope.task_description = '';
                    if (data.success === true) {
                        $scope.tasks.push(data.task);
                    }
                });
        }
    };

    $scope.MarkAsDone = function(task_guid) {
        QueryService.MarkTaskAsDone(task_guid)
            .success(function(data) {
                $scope.tasks = $scope.tasks.filter(function( obj ) {
                    return obj.task_guid !== task_guid;
                });
            });
    }

});
app.factory("QueryService", function($http) {
    return {
        AddNewTask: function(task_description) {
            return $http.post('/task', {
                task_description: task_description
            });
        },
        GetAllUserTasks: function() {
            return $http.get('/task');
        },
        MarkTaskAsDone: function(task_guid) {
            return $http.post('/task/'+task_guid+'/done');
        }
    };
});
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });

                event.preventDefault();
            }
        });
    };
});
