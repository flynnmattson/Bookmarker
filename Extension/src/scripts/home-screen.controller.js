var t;
app.controller('HomeScreenCtrl', ['$scope', 'Auth', 'ref', 'AuthService', '$firebaseArray',
  function($scope, Auth, ref, AuthService, $firebaseArray) {
    t = $scope;
    $scope.currentUser = AuthService.currentUser(),
    $scope.isLoggedIn = AuthService.isLoggedIn(),
    $scope.items = [];

    function getBookmarks(uid) {
      var link = "https://de-bookmarker.firebaseio.com/users/" + uid + "/bookmarks";
      var userRef = new Firebase(link);
      userRef.on("value" , function(snapshot) {
        if(snapshot.val() !== null) {
          angular.copy(snapshot.val(), $scope.items);
          $scope.$apply();
          return;
        }
      }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
      $scope.items = [];
    }

    //getBookmarks($scope.currentUser);
    var link = "https://de-bookmarker.firebaseio.com/users/" + $scope.currentUser + "/bookmarks";
    var userRef = new Firebase(link);
    $scope.items = $firebaseArray(userRef);
    console.log($scope.items);

    // Now using AuthService factory that includes awesome methods!!
    $scope.$watch(AuthService.isLoggedIn, function(isLoggedIn) {
      $scope.isLoggedIn = isLoggedIn;
    });
    // Retrieves the current user uid
    $scope.$watch(AuthService.currentUser, function(currentUser) {
      $scope.currentUser = currentUser;
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

    $scope.linkBookmarks = function() {
      chrome.bookmarks.getTree(function(itemTree){
        var data = [];
        itemTree.forEach(function(item){
          item.children[0].children.forEach(function(bm){
            if (bm.url) {
              data.push(processNode(bm));
            }
          });
        });
        ref.child("users").child($scope.currentUser).child("bookmarks").update(data);
        getBookmarks($scope.currentUser);
      });

      function processNode(node) {
        // If there is a child then this node is a folder.
        // if(node.children) {
        //   var theChildren = []
        //   node.children.forEach(function(child) {
        //      theChildren.push(processNode(child));
        //   });
        //   return {
        //     "id" : node.id,
        //     "children" : theChildren,
        //     "title" : node.title
        //   };
        // }

        // If there is a url then this node is a bookmarked link.
        if(node.url) {
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
