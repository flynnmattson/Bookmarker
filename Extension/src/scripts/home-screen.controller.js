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
              $scope.$apply();
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
