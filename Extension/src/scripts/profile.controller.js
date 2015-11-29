app.controller('ProfileCtrl', ['$scope', 'Auth', 'ref',
    function($scope, Auth, ref) {

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
          ref.child("users").child($scope.currentUser).chid
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
