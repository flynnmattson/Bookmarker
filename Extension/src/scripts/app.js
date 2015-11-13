var app = angular.module('Bookmarker', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'firebase']);

app.factory('Auth', ['$firebaseAuth',
  function($firebaseAuth) {
    var ref = new Firebase('https://de-bookmarker.firebaseio.com/');
    return $firebaseAuth(ref);
  }
]);

app.factory('ref', [
  function() {
    return new Firebase('https://de-bookmarker.firebaseio.com/');
  }
]);

app.controller('LoginCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

    // close an specified alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.Login = function() {
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
          window.location.href = './home-screen.html';

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

app.controller('RegisterCtrl', ['$scope', 'Auth',
    function($scope, Auth){

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

app.controller('HomeScreenCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

      // try to retrieve token from local storage
      chrome.storage.local.get('AUTH_TOKEN', function (result) {
        if(result.AUTH_TOKEN){
          // try to authenticate user again with the token stored in the last session
          Auth.$authWithCustomToken(
            result.AUTH_TOKEN

          ).then(function(authData) {
            // if successfull, user has been signed in to his/her account
          }).catch(function(error) {
            // user could not be logged in
            window.location.href = './login.html';
          });
        }
        else {
          // user has not logged in yet
          window.location.href = './login.html';
        }
      });

      // unauthenticate user and remove token from local storage
      $scope.logout = function() {
        // sign out user
        ref.unauth();
        var authData = ref.getAuth();
        if(authData) {
          // user could not be logged out
        }
        else {
          // if nothing, user has been signed out
          // remove token from local storage
          chrome.storage.local.remove('AUTH_TOKEN', function(){
              alert('You have successfully signed out!');
              window.location.href = './login.html';
          });
        }
      };


      // Gives you the URL of the current tab on the browser.
      chrome.tabs.getSelected(null, function(tab){
        $scope.currentTab = tab.url;
      });

      // Creates a new tab in the browser.
      $scope.createTab = function createTab(link) {
        chrome.tabs.create({"url":link});
      };

      $scope.items = [];

      $scope.linkBookmarks = function() {
        chrome.bookmarks.getTree(function(itemTree){
          itemTree.forEach(function(item){
              console.log(item);
              var data = processNode(item);
              console.log(data);
              ref.child("users").child("flynn").push(data);
          });
        });

        function processNode(node) {
          // If there is a child then this node is a folder.
          if(node.children) {
            var theChildren = []
            node.children.forEach(function(child) {
               theChildren.push(processNode(child));
            });
            return {
              "id" : node.id,
              "children" : theChildren,
              "title" : node.title
            };
          }

          // If there is a url then this node is a bookmarked link.
          if(node.url) {
            $scope.items.push({
                "title" : node.title,
                "url" : node.url
            });
            return {
              "id" : node.id,
              "parentId" : node.parentId,
              "title" : node.title,
              "url" : node.url
            };
          }
        }
      };
    }
]);
