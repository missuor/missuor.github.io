(function (window, angular) {
  var m = angular.module('ngSlotmachine', [
    'app.conf',
    'app.events'
  ]);

  m.directive('slotmachine', ["$timeout", 'conf', 'events', function ($timeout, conf, events) {
    return {
      require: '?^ngModel',
      templateUrl: conf.templateUrl + '/plugin/slotmachine.html',

      link: function (scope, element, attrs, ngModel) {
        scope.$on(events.repeatFinished, function () {
          var machine4 = $(".slotMachine").slotMachine({
            active: 0,
            delay: 500
          });

          $("#slotMachineButtonShuffle").click(function () {
            machine4.shuffle();
          });

          $("#slotMachineButtonStop").click(function () {
            machine4.stop();
          });

        });
      }
    };
  }]);

})(window, angular || window.angular);
