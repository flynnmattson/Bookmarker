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
          window.location.href = './home-screen.html';
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

app.controller('AccordionDemoCtrl', ['$scope', 'ref',
    function ($scope, ref) {
      $scope.oneAtATime = false;

      // Gives you the URL of the current tab on the browser.
      chrome.tabs.getSelected(null, function(tab){
        $scope.currentTab = tab.url;
      });

      // Creates a new tab in the browser.
      $scope.createTab = function createTab(link) {
        chrome.tabs.create({"url":link});
      };

      $scope.items = [];

      $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
      };

      $scope.linkBookmarks = function() {
        chrome.bookmarks.getTree(function(itemTree){
          itemTree.forEach(function(item){
              //console.log(item);
              var data = processNode(item);
              console.log(data);
              ref.child("users").child("flynn").set(data);
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
