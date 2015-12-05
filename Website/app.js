var app = angular.module('Bookmarker', ['ngRoute', 'ngCookies', 'ngAnimate', 'ui.bootstrap', 'firebase']);

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


app.config()
{
  
}
