;(function(){//IIFE

angular.module('brewKeeper')
      .controller('brewIt', function($scope, $http, $routeParams, $location, $route, $rootScope){
        var id = $routeParams.id;
        var username =$routeParams.username;
        $scope.username = $routeParams.username;

        //load the data if the page is manually reset
        window.onload = function(){
          $http.get('https://brew-keeper-api.herokuapp.com/api/users/' + username + '/recipes/' + id + "/")
            .then(function(response){
              $rootScope.detail = response.data;
              $rootScope.steps = response.data.steps;
              $rootScope.notes = response.data.brewnotes;
              var stepArray = [] //create an array of step #'s'
              for(step in $rootScope.steps){
                stepArray.push($rootScope.steps[step].step_number)
              };
              $rootScope.stepArray = stepArray;
            });
          $scope.resetBrew();
        }


        var stepArray = [] //create an array of step #'s'
        for(step in $rootScope.steps){
          stepArray.push($rootScope.steps[step].step_number)
        };
        $rootScope.stepArray = stepArray;
        var timerRunning = false //logic for brew timer
        //start brew function
        $scope.startBrew = function(brewCount){
          if(timerRunning){
            return;
          }
          $("timer.delay").addClass("hidden");
          $("."+$scope.stepArray[0]).addClass("current-step");
          $("timer."+$scope.stepArray[0]).removeClass("hidden");
          // $('timer')[0].start();
          $('timer')[1].start();
          timerRunning = true;
        };

        //runs when brew again button pushed
        $scope.reStartBrew = function(){
          if(timerRunning){
            return;
          }
          $("timer.delay").removeClass("hidden");
          $("button.restart-brew").addClass("hidden");
          $('timer')[0].start();
        }

        // $scope.stopBrew = function(){
        //   console.log("pause button pressed");
        //   $scope.$broadcast('timer-stop');
        // }; //This can be used to pause process if needed.

        $scope.resetBrew = function(){
          $("timer.delay").addClass("hidden");
          $("div.hidden").removeClass("hidden");
          $(".current-step").removeClass("current-step");
          $scope.$broadcast('timer-reset');
          $("button.restart-brew").removeClass("hidden");
          timerRunning = false;

          //getting the data again solves the timers not
          //resetting correctly
          $http.get('https://brew-keeper-api.herokuapp.com/api/users/' + username + '/recipes/' + id + '/')
            .then(function(response){
              $scope.detail = response.data;
              $scope.steps = response.data.steps;
              $scope.notes = response.data.brewnotes;
              $scope.countdownVal = response.data.total_duration;
            })
        };

        // $scope.finishBrew = function(id){
        //   $scope.nextStep(id);
        //   $("."+id).removeClass("current-step");
        //   $("."+id).addClass("hidden")
        // };
        $scope.nextStep = function(stepNumber, brewCount){
          var nextStepIndex = $scope.stepArray.indexOf(stepNumber) + 1;
          var nextStep = $scope.stepArray[nextStepIndex];
          var nextTimerId = $scope.stepArray.indexOf(stepNumber) + 2;
          if(nextStepIndex >= $scope.steps.length){
            //end of brew countdown
            $scope.resetBrew();
            //update brew_count
            var recipe = {};
            recipe.brew_count = brewCount + 1;
            // brewCount++; //increment brew counter
            $http.patch('https://brew-keeper-api.herokuapp.com/api/users/' + username + '/recipes/' + id + '/', recipe);
            return
          }
          $("."+ stepNumber).removeClass("current-step");
          $("."+ stepNumber).addClass("hidden");
          $("timer."+nextStep).removeClass("hidden");
          $("."+ nextStep).addClass("current-step");
          $('timer')[nextTimerId].start();
        };
      $scope.brewnote = { }
      $scope.addBrewNote=function(){
        $http.post('https://brew-keeper-api.herokuapp.com/api/users/' + username + '/recipes/' + id + '/brewnotes/', $scope.brewnote)
        .success(function (data) {
          var id = data.id
        })
      $scope.brewnote = { };
      }//Add Brew Note Form

      $(".add-brew-note").on('click', function() {
        $(".brew-form").removeClass("hidden");
      })
      $(".save-note").on('click', function() {
        $(".brew-form").addClass("hidden");
      });//Add hidden class to brewNote form on submit
      $(".cancel-note").on('click', function() {
        $(".brew-form").addClass("hidden");
      });//Cancel BrewNote form
    })


})();//END Angular IIFE
