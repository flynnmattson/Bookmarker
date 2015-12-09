var t;

app.controller('HomeScreenCtrl', ['$scope', '$rootScope', '$sce', '$q', '$firebaseObject', '$firebaseArray', 'Auth', 'ref', 'AuthService',
  function($scope, $rootScope, $sce, $q, $firebaseObject, $firebaseArray, Auth, ref, AuthService) {

    t = $scope;
    $scope.showProfile = false;
    $scope.showHome = true;

    AuthService.isLoggedIn();
    $scope.currentUser = AuthService.currentUser();

    if($scope.currentUser){

      getUsers();
      $scope.selectedBookmarks = [];
      $scope.selectedFriends = [];

      $scope.shareInput = {};
      $scope.autocomplete_share_options = {
        suggest: suggest_friend,
        on_select: select_friend
      };
    }

    // suggest friends to share bookmarks with based on user's input and friends list
    function suggest_friend(term) {
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
                friend.name +
              '</div>'
            )
          });
      }
      return results;
    }

    // select friend to share bookmarks with
    function select_friend(selected) {
      $scope.selectedFriends.push({id: selected.obj.$id, name: selected.value});
      $scope.shareInput.value = undefined;

      console.log($scope.selectedFriends);
      console.log($scope.selectedBookmarks);
    };

    // get the list of bookmarks for the current user
    function getBookmarks(uid) {
      var bookmarksLink = "https://de-bookmarker.firebaseio.com/users/" + uid + "/bookmarks";
      var bookmarksRef = new Firebase(bookmarksLink);
      $firebaseArray(bookmarksRef).$loaded().then(function(bookmarks) {
        $scope.mybookmarks = bookmarks;
      });
    }

    // get the list of bookmarks shared with the current user
    function getShares(uid) {
      var shareslink = "https://de-bookmarker.firebaseio.com/shares/" + uid;
      var sharesRef = new Firebase(shareslink);

      $firebaseArray(sharesRef).$loaded().then(function(data) {
        $scope.sharedWithMe = data;
        console.log($scope.sharedWithMe);
      });
    }

    // get the list of friends for the current user
    function getFriends(uid) {
      $scope.friends = [];
      var index = $scope.users.$indexFor(uid);
      $scope.friends.push($scope.users[index].friends);

      for(var i = 0; i < $scope.users.length; i++) {
        if($scope.friends[0].hasOwnProperty($scope.users.$keyAt(i))){
          $scope.friends.push($scope.users[i]);
        }
      }
      $scope.friends.shift();
    }

    // retrieve the full list of users in to an array
    function getUsers() {
      var userslink = "https://de-bookmarker.firebaseio.com/users";
      var usersRef = new Firebase(userslink);

      $firebaseArray(usersRef).$loaded().then(function(data) {
        $scope.users = data;

        // set variables for current (logged) user
        getBookmarks($scope.currentUser);
        getShares($scope.currentUser);
        getFriends($scope.currentUser);
      });
    }

    $scope.Search = function(searchName)
    {
      //see if searchitem is in database
      var link = "https://de-bookmarker.firebaseio.com/users";
      var userRef = new Firebase(link);

      $firebaseArray(userRef).$loaded().then(function(data) {
        $scope.users = data;
        var found = false;
        for(var i = 0; i < $scope.users.length; i++)
        {
          if ($scope.users[i].name === searchName)
          {
            if($scope.users[i].$id !== $scope.currentUser)
            {
              //save user in service var to load in profile page
              $scope.profile = $scope.users[i];
              console.log($scope.profile);
              found = true;
              $scope.showHome = false;
              $scope.showProfile = true;
            }
          }
        }

        if(!found)
        {
          prompt("User not found, please search again");
          console.log("Finished with search. Results: " + found);
        }
      });
    };

    $scope.Share = function()
    {
      for(var i = 0; i < $scope.selectedFriends.length; i++) {
        var data = [];
        $scope.selectedBookmarks.forEach(function(item){
          data.push(processNode(item));
        });
        ref.child("shares").child($scope.selectedFriends[i].id).child($scope.currentUser).update(data);
      }
      $scope.selectedBookmarks = [];
      $scope.selectedFriends = [];
      alert("Bookmarks sent!");
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
    };

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

    $scope.addCurrentWindow = function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
       // since only one tab should be active and in the current window at once
       // the return variable should only have one entry
       var activeTabName = arrayOfTabs[0].title;
       var activeTabId = arrayOfTabs[0].id; // or do whatever you need
       var activeTabUrl = arrayOfTabs[0].url;
       var newBookmark = {
         id : activeTabId,
         title : activeTabName,
         url : activeTabUrl
       };
       $scope.mybookmarks.$add(newBookmark);
     });
    };

      // chrome.tabs.getSelected(null, function(currentTab) {
      //   console.log(currentTab);
      // });

    //**************************************************************************
    //**************************************************************************
    //*****************************PROFILE PAGE*********************************
    //**************************************************************************
    //**************************************************************************
    /*Declare variables*/
    $scope.addButton = "";
    $scope.subscribeButton = "";

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
        //grab the profile that is visted
        var link = "https://de-bookmarker.firebaseio.com/users/" + $scope.profile.$id;
        var userRef = new Firebase(link);
        var key = $scope.currentUser;

        //add current person to other persons friend request list
        userRef.child("friendRequests").child($scope.currentUser).update({
          userID : $scope.currentUser
        });
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
      $scope.showProfile = false;
      $scope.showHome = true;
    };

  }
]);
