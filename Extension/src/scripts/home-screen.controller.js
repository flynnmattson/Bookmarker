var t;
app.controller('HomeScreenCtrl', ['$scope', 'Auth', 'ref', 'AuthService', '$firebaseArray',
  function($scope, Auth, ref, AuthService, $firebaseArray) {

    t = $scope;
    AuthService.isLoggedIn(),
    $scope.currentUser = AuthService.currentUser()

    if($scope.currentUser){

      getBookmarks($scope.currentUser);
      $scope.selectedBookmarks = [];
    }

    function getBookmarks(uid) {
      var bookmarkslink = "https://de-bookmarker.firebaseio.com/users/" + uid + "/bookmarks";
      var bookmarksRef = new Firebase(bookmarkslink);
      $scope.mybookmarks = $firebaseArray(bookmarksRef);
    }

    // open a bookmark in a new tab in the browser.
    $scope.OpenBookmarkLink = function OpenBookmarkLink(link) {
      chrome.tabs.create({"url":link});
    };

    $scope.copyBookmarksFromChrome = function() {
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
    };
  }
]);
