var t;
app.controller('HomeScreenCtrl', ['$scope', '$rootScope', 'profilePageService', '$firebaseObject', '$firebaseArray', 'Auth', 'ref', 'AuthService',
  function($scope, $rootScope, profilePageService, $firebaseObject, $firebaseArray, Auth, ref, AuthService) {
    t = $scope;
    $scope.currentUser = AuthService.currentUser(),
    $scope.isLoggedIn = AuthService.isLoggedIn(),
    $scope.items = [];
    $scope.searchItem;
    $scope.users = [];
    $scope.hideProfile = true;
    $scope.hideHome = false;

    $scope.Search = function()
    {
      //see if searchitem is in database
      var link = "https://de-bookmarker.firebaseio.com/users";
      var userRef = new Firebase(link);

      $scope.users = $firebaseArray(userRef);

      $scope.users.$loaded().then(function()
      {
        var found = false;
        var user;
        for(var i = 0; i < $scope.users.length; i++)
        {
          prompt("Entering for loop");
          if ($scope.users[i].name === $scope.searchItem)
          {
            prompt("User found");
            //save user in service var to load in profile page
            $scope.profile = $scope.users[i];
            console.log($scope.profile);
            found = true;
            hideHome = true;
            hideProfile = false;
          }
          else {
            prompt("User not found");
          }
        }

        if(!found)
        {
          prompt("User not found, please search again");
          console.log("Finished with search. Results: " + found);
        }
    });
  };

    function getBookmarks(uid) {
      var link = "https://de-bookmarker.firebaseio.com/users/" + uid + "/bookmarks";
      var userRef = new Firebase(link);
      userRef.on("value" , function(snapshot) {
        if(snapshot.val() !== null) {
          $scope.items = angular.copy(snapshot.val());
          $scope.$apply();
          return;
        }
      }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
      $scope.items = [];
    }

    getBookmarks($scope.currentUser);

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
          item.children[0].children[0].children.forEach(function(bm){
            data.push(processNode(bm));
          });
        });
        ref.child("users").child($scope.currentUser).child("bookmarks").update(data);
        getBookmarks($scope.currentUser);
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
          return {
            "id" : node.id,
            "parentId" : node.parentId,
            "title" : node.title,
            "url" : node.url
          };
        }
      }
    };

    //**************************************************************************
    //**************************************************************************
    //*****************************PROFILE PAGE*********************************
    //**************************************************************************
    //**************************************************************************
    /*Declare variables*/
    $scope.addButton = "";
    $scope.subscribeButton = "";
    $scope.profile = "";

    $scope.loadButtons = function()
    {
      /*Conditions in if statements will be obtained from DB*/

      /*Load ADD button*/
      if(true) /*if person is NOT in friends list*/
      {
        $scope.addButton = "Add";
      }
      else if(true) /* if person IS in friends list */
      {
        $scope.addButton = "Remove";
      }
      else if(true) /*if person is in friends REQUEST list*/
      {
        $scope.addButton = "Accept";
      }
      else if(true) /*if USER is in OTHER'S friend REQUEST list*/
      {
        $scope.addButton = "Cancel Request";
      }

      /*Load SUBSCRIBE button*/
      if(true) /*if person is NOT in subscription list*/
      {
        $scope.subscribeButton = "Subscribe";
      }
      else if(true)
      {
        $scope.subscribeButton = "Unsubscribe";
      }
    };

    $scope.updateAddButton = function()
    {
      if($scope.addButton == "Add")
      {
        $scope.addButton = "Cancel Request";
        /*place THIS person in OTHERS friend requests in db*/

      }
      else if($scope.addButton == "Cancel Request")
      {
        $scope.addButton = "Add";
        /*remove THIS person from OTHERS friend requests in db*/
      }
      else if($scope.addButton == "Accept")
      {
        $scope.addButton = "Remove";
        /* place THIS person in OTHERS friends in db*/
        /* place OTHER person in THIS friends in db*/
      }
      else if($scope.addButton == "Remove")
      {
        $scope.addButton = "Add";
        /* remove THIS person from OTHERS friends in db*/
        /* remove OTHER person from THIS friends in db*/
      }
    };

    $scope.updateSubscribeButton = function()
    {
      if($scope.subscribeButton == "Subscribe")
      {
        $scope.subscribeButton = "Unsubscribe";
        /* place OTHER in THIS person's subscriptions*/
      }
      else if($scope.subscribeButton == "Unsubscribe")
      {
        $scope.subscribeButton = "Subscribe";
        /* remove OTHER from THIS person's subscriptions*/
      }
    };

    /*Not quite working yet...not sure why*/
    $scope.goBack = function()
    {
      window.location.href = './home-screen.html';
    };
  }
]);
