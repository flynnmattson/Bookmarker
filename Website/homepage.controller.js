app.controller('homepageCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

    // close an specified alert message
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.cancel = function() {
      window.location = "https://chrome.google.com/webstore/category/apps";
    };

    $scope.downloadExtension = function()
    {
        window.location = "https://chrome.google.com/webstore/category/apps";
    };
  }
]);
