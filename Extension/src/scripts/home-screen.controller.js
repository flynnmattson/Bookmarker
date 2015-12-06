var t;

app.controller('HomeScreenCtrl', ['$scope', '$rootScope', '$sce', '$q', '$firebaseObject', '$firebaseArray', 'Auth', 'ref', 'AuthService',
  function($scope, $rootScope, $sce, $q, $firebaseObject, $firebaseArray, Auth, ref, AuthService) {

    t = $scope;
    $scope.users = [];
    $scope.hideProfile = true;
    $scope.hideHome = false;

    AuthService.isLoggedIn(),
    $scope.currentUser = AuthService.currentUser()

    if($scope.currentUser){

      getBookmarks($scope.currentUser);
      //getFriends($scope.currentUser)
      $scope.friends = [{id: "1", name: "Dalia"}, {id: "2", name: "Flynn"}];

      $scope.selectedBookmarks = [];
      $scope.selectedFriends = [];

      $scope.dirty = {};
      $scope.autocomplete_options = {
        suggest: suggest_friend_as_tag,
        on_select: function (selected) {
          $scope.selected_user = selected.obj;
        }
      };
    }

    function suggest_friend_as_tag(term) {
      var q = term.toLowerCase().trim();
      var results = [];

      for (var i = 0; i < $scope.friends.length; i++) {
        var friend = $scope.friends[i];
        if (friend.name.toLowerCase().indexOf(q) === 0)
          results.push({
            value: friend.name,
            obj: friend,
            label: $sce.trustAsHtml(
              '<div>'+
                '<span class="glyphicon glyphicon-user" aria-hidden="true"></span> ' + 
                highlight(friend.name,term) +
              '</div>'
            )
          });
      }
      return results;
    }

    function highlight(str, term) {
      var highlight_regex = new RegExp('(' + term + ')', 'gi');
      return str.replace(highlight_regex,
        '<span class="highlight">$1</span>');
    };

    function getFriends(uid) {
      var friendslink = "https://de-bookmarker.firebaseio.com/users/" + uid + "/friends";
      var friendsRef = new Firebase(friendslink);
      $scope.friends = $firebaseArray(friendsRef);
    }


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
          // Currently this only grabs the bookmarks in your Bookmarks bar folder from the tree that the API gives you
          // !!!does not grab folders.
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

    $scope.addCurrentWindow = function() {
      chrome.tabs.getSelected(null, function(currentTab) {
        console.log(currentTab);
      });
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
