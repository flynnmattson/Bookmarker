
var app = angular.module('Bookmarker', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'firebase']);

app.factory('Auth', ['$firebaseAuth',
  function($firebaseAuth) {
    var ref = new Firebase('https://de-bookmarker.firebaseio.com/');
    return $firebaseAuth(ref);
  }
]);

app.controller('RegisterCtrl', ['$scope', 'Auth',
    function($scope, Auth){

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.cancel = function() {
      window.location.href = './login.html';
    };

    $scope.createAccount = function() {

      $scope.alerts = [];
      var allComplete = $scope.name && $scope.email && $scope.password;

      if(!allComplete)
        $scope.alerts.push({type: 'danger', msg: 'Please complete all fields!'});
      else {

        var regExpName = new RegExp(/^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/);

        if(!regExpName.test($scope.name)) {
          $scope.alerts.push({type: 'danger', msg: 'The name you entered is not a valid name.'});
          $scope.alerts.push({type: 'warning', msg: 'Please enter your first and last name.'});
        } else {

          Auth.$createUser({
            email : $scope.email,
            password : $scope.password

          }).then(function(userData) {
            console.log('User created with uid: ' + userData.uid);
            $scope.alerts.push({type: 'success', msg: 'Your account has been created!'});

          }).catch(function(error) {

            switch (error.code) {
              case "EMAIL_TAKEN":
                console.log(error.message);
                $scope.alerts.push({type: 'danger', msg: 'The email address you entered is already in use.'});
                break;
              case "INVALID_EMAIL":
                console.log(error.message);
                $scope.alerts.push({type: 'danger', msg: 'The email address you entered is not a valid email.'});
                break;
              default:
                console.log(error.message);
                $scope.alerts.push({type: 'danger', msg: 'There was an error creating your account:' + error.message});
            }
          });
        }
      }
    };
  }
]);
