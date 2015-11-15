app.controller('RegistrationCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

    // close an specified alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    // redirect user back to the login page
    $scope.cancel = function() {
      window.location.href = './login.html';
    };

    $scope.createAccount = function() {

      // clear all alert messages
      $scope.alerts = [];

      // verify if all fields have been filled in
      var allComplete = $scope.name && $scope.email && $scope.password && $scope.repassword;
      if(!allComplete)
        $scope.alerts.push({type: 'danger', msg: 'Please complete all fields!'});

      else {

        var error = false;

        // verify if passwords match
        if($scope.password != $scope.repassword){
          $scope.alerts.push({type: 'danger', msg: 'The password does not match confirmation!'});
          error = true;
        }

        // verify if the name user has entered is a valid name
        var regExpName = new RegExp(/^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/);
        if(!regExpName.test($scope.name)) {
          $scope.alerts.push({type: 'danger', msg: 'The name you entered is not a valid name.'});
          $scope.alerts.push({type: 'warning', msg: 'Please enter your first and last name.'});
          error = true;
        }

        if(!error) {

          // try to register a new user
          Auth.$createUser({
            email : $scope.email,
            password : $scope.password

          }).then(function(userData) {
            // if successfull, a new user account has been created
            // save user full name on database
            ref.child("users").child(userData.uid).set({
              name: $scope.name
            });
            alert('Your account has been created!');
            window.location.href = './login.html';

          }).catch(function(error) {
            // the new user account could not be created
            switch (error.code) {
              case "EMAIL_TAKEN":
                $scope.alerts.push({type: 'danger', msg: 'The email address you entered is already in use.'});
                break;
              case "INVALID_EMAIL":
                $scope.alerts.push({type: 'danger', msg: 'The email address you entered is not a valid email.'});
                break;
              default:
                $scope.alerts.push({type: 'danger', msg: 'There was an error creating your account:' + error.message});
            }
          });
        }
      }
    };
  }
]);
