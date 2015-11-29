app.controller('homepageCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

    $scope.downloadExtension = function()
    {
        window.location = "https://chrome.google.com/webstore/category/extensions";
    };
  }
]);
