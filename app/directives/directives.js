angular.module('app.directives', ['app.conf', 'app.events'])

.directive('autoIn', function () {
  return function (scope, element, attrs) {
    element.on('click', function () {
      element.removeClass('in');
    });
  };
})

.directive('onChange', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      onChange: '&'
    },
    link: function link(scope, element, attrs, ctrl) {
      element.on('change', handleChange);

      scope.$on('destroy', function () {
        element.off('change', handleChange);
      });

      function handleChange() {
        ctrl.$setViewValue(element[0].files[0]);
        scope.onChange();
      }
    }
  };
})

.directive('emitOnFinished', ['conf', 'events', function (conf, events) {
  return function (scope) {
    if (scope.$last) {
      if (conf.enableDebug) {
        console.log('emit events.repeatFinished');
      }
      scope.$emit(events.repeatFinished);
    }
  };
}]);
