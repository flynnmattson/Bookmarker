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

app.factory('AuthService', ['Auth', 'ref', '$firebaseArray',
  function(Auth, ref, $firebaseArray) {
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
        var data = $firebaseArray(userRef);
        console.log(data);
      }
    };
  }
]);
