var minib = angular.module('minib', ['ngRoute', 'firebase']);

minib.run(function($rootScope, $location, $firebaseSimpleLogin, firebaseRef) {
  $rootScope.auth = $firebaseSimpleLogin(firebaseRef());
  $rootScope.auth.$getCurrentUser().then(function(user) {
    if (user) {
      $rootScope.currentUser = user;
    } else {
      $location.path('/login');
    }
  });
});

app.controller('LoginCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

    // close an specified alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.cancel = function() {
      window.location = 'homepage.html';
    };

    $scope.login = function(){
      // clear all alert messages
      $scope.alerts = [];

      // verify if all fields have been filled in
      var allComplete = $scope.email && $scope.password;
      if(!allComplete)
        $scope.alerts.push({type: 'danger', msg: 'Please enter your email and password!'});

      else {

        // try to authenticate user
        Auth.$authWithPassword({
          email : $scope.email,
          password : $scope.password

        }).then(function(authData) {
          // if successfull, user has been signed in to his/her account
          // store the Firebase authentication token for this session
          chrome.storage.local.set({'AUTH_TOKEN': authData.token});
          // redirect user to the home screen
          window.location.href = 'dashboard.html';

        }).catch(function(error) {
          // user could not be logged in
          switch (error.code) {
            case "INVALID_EMAIL":
              $scope.alerts.push({type: 'danger', msg: 'The email address you entered is not a valid email.'});
              break;
            case "INVALID_USER":
              $scope.alerts.push({type: 'danger', msg: 'The specified user account does not exist.'});
              break;
            case "INVALID_PASSWORD":
              $scope.alerts.push({type: 'danger', msg: 'The password you entered is incorrect.'});
            break;
            default:
              $scope.alerts.push({type: 'danger', msg: 'There was an error signing you in to your account: ' + error.message});
          }
        });
      }
    };
  }
]);
