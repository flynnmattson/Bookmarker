
var app = angular.module('Bookmarker', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'firebase']);

app.factory('Auth', ['$firebaseAuth',
  function($firebaseAuth) {
    var ref = new Firebase('https://de-bookmarker.firebaseio.com/');
    return $firebaseAuth(ref);
  }
]);

app.controller('LoginCtrl', ['$scope', 'Auth',
    function($scope, Auth){

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.Login = function() {

      $scope.alerts = [];
      var allComplete = $scope.email && $scope.password;

      if(!allComplete)
        $scope.alerts.push({type: 'danger', msg: 'Please enter your email and password!'});
      else {

        Auth.$authWithPassword({
          email : $scope.email,
          password : $scope.password

        }).then(function(authData) {
          console.log("Logged in as:", authData.uid);
          $scope.alerts.push({type: 'success', msg: 'You are logged in!'});

        }).catch(function(error) {

          switch (error.code) {
            case "INVALID_EMAIL":
              console.log(error.message);
              $scope.alerts.push({type: 'danger', msg: 'The email address you entered is not a valid email.'});
              break;
            case "INVALID_USER":
              console.log(error.message);
              $scope.alerts.push({type: 'danger', msg: 'The specified user account does not exist.'});
              break;
            case "INVALID_PASSWORD":
              console.log(error.message);
              $scope.alerts.push({type: 'danger', msg: 'The password you entered is incorrect.'});
            break;
            default:
              console.log(error.message);
              $scope.alerts.push({type: 'danger', msg: 'There was an error signing you in to your account:' + error.message});
          }
        });
      }
    };
  }
]);
