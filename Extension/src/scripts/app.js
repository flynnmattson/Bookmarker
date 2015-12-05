var app = angular.module('Bookmarker', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'firebase']);

app.factory('ref', [
  function() {
    return new Firebase('https://de-bookmarker.firebaseio.com/');
  }
]);

app.factory('Auth', ['$firebaseAuth', 'ref',
  function($firebaseAuth, ref) {
    return $firebaseAuth(ref);
  }
]);

app.service('profilePageService', ['$firebaseArray', function($firebaseArray) {
  var profileToRetreieve = {}
  function set(searchItem)
  {
    //see if searchitem is in database
    var link = "https://de-bookmarker.firebaseio.com/users";
    var userRef = new Firebase(link);

    var users = $firebaseArray(userRef);

    users.$loaded().then(function()
    {
      var found = false;
      console.log(users.length);
      for(var i = 0; i < users.length; i++)
      {
        if (users[i].name === searchItem)
        {
          //save user in service var to load in profile page
          prompt("User found");
          profileToRetreieve = users[i];
          console.log(profileToRetreieve);
          found = true;
        }
        console.log(users[i]);
      }
      if(found == false)
      {
        profileToRetreieve = null;
      }
    });
  }
  function get()
  {
    console.log(profileToRetreieve);
    return profileToRetreieve;
  }

  return {
    set: set,
    get: get
  }
}]);

app.factory('AuthService', ['Auth', 'ref',
  function(Auth, ref) {
    return {
      isLoggedIn: function() {
        chrome.storage.local.get('AUTH_TOKEN', function (result) {
          if(result.AUTH_TOKEN){
            // try to authenticate user again with the token stored in the last session
            Auth.$authWithCustomToken(
              result.AUTH_TOKEN
            ).then(function(authData) {
              // if successfull, user has been signed in to his/her account
              //currentUser = authData.uid;
              return true;
            }).catch(function(error) {
              // user could not be logged in
              window.location.href = './login.html';
              return false;
            });
          }
          else {
            // user has not logged in yet
            window.location.href = './login.html';
            return false;
          }
        });
      },
      currentUser: function() {
        var authData = ref.getAuth();
        if (authData) {
          return authData.uid;
        } else {
          console.log("User is logged out");
        }
      },
      getBookmarks: function(uid) {
        var link = "https://de-bookmarker.firebaseio.com/users/" + uid + "/bookmarks";
        var userRef = new Firebase(link);
        userRef.on("value" , function(snapshot) {
          console.log(snapshot.val());
          if(snapshot.val() !== null)
            return angular.copy(snapshot.val());
          else
            return [];
        }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
          return [];
        });
        return [];
      }
    };
  }
]);
