angular.module('app.controllers.auth', [
  'ngDialog',
  'app.conf',
  'app.events',
  'app.services.auth'
])

.controller('authCtrl.login', [

  '$rootScope', '$scope', '$state', '$location', 'events', 'conf', 'auth',

  function ($rootScope, $scope, $state, $location, events, conf, auth) {
    var committed = false;
    if (!auth.isAuthenticated()) {
      $scope.user = {
        'username': '',
        'password': '',
        'remember': false
      };
    } else {
      $scope.user = auth.getUser();
    }
    setTimeout(function () {
      angular.element('.login input').each(function () {
        angular.element(this).attr("readonly", false);
      });
    }, 100);
    $scope.enableSubmit = function () {
      return !committed && !(angular.isEmptyObject($scope.user.username) || angular.isEmptyObject($scope.user.password));
    };

    $scope.login = function () {
      auth.login($scope.user).then(function (data) {
        if (conf.debug.auth) {
          console.log('authCtrl.login success. data:', data);
        }
        $rootScope.globals.user = auth.getUser();
        $rootScope.$broadcast(events.authLoginSuccess);
      }, function (data) {
        if (conf.debug.auth) {
          console.log('authCtrl.login failure. data:', data);
        }
        $scope.errors = data.errors;
        $rootScope.$broadcast(events.authLoginFailed);
      });
    };
  }
])

.controller('authCtrl.logout', [

  '$rootScope', '$state', 'events', 'auth',

  function ($rootScope, $state, events, auth) {
    auth.logout().then(function (data) {
      if (conf.debug.auth) {
        console.log('authCtrl.logout success. data:', data);
      }
      $rootScope.globals.user = auth.getUser();
      $rootScope.$broadcast(events.authLogoutSuccess);
    }, function (data) {
      if (conf.debug.auth) {
        console.log('authCtrl.logout failure. data:', data);
      }
      $scope.errors = data.errors;
      $rootScope.$broadcast(events.authLogoutFailed);
    });
  }
])

.directive('loginDialog', [

  'ngDialog', 'conf', 'events', 'auth',

  function (ngDialog, conf, events, auth) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.attr('style', 'cursor: pointer;');
        element.on('click', function () {
          if (scope.$state.current.name === 'auth.login') {
            return;
          }
          if (!auth.isAuthenticated()) {
            dialog = ngDialog.open({
              template: conf.templateUrl + '/auth/login.html',
              controller: 'authCtrl.login',
              className: 'ngdialog-theme-plain',
              showClose: false
            });
            scope.$on('ngDialog.opened', function () {
              setTimeout(function () {
                angular.element('.login input').each(function () {
                  $(this).attr("readonly", false);
                });
              }, 200);
            });

            scope.$on('ngDialog.closing', function () {
              $('.login-box').removeClass('random-background');
            });

            scope.$on(events.authLoginSuccess, function () {
              dialog.close(dialog.id);
            });
          } else {
            auth.logout().then(function (data) {
              scope.$emit(events.broadcastToAll, events.authLogoutSuccess);
            });
          }
        });

        scope.$on(events.httpUnAuthorized, function () {
          if (conf.debug.auth) {
            console.info('loginDialog listen events.authLoginSuccess auth.isAuthenticated():', auth.isAuthenticated());
          }
          element.html(auth.isAnonymous() && '登录' || '注销');
        });
        scope.$on(events.authLoginSuccess, function () {
          if (conf.debug.auth) {
            console.info('loginDialog listen events.authLoginSuccess auth.isAuthenticated():', auth.isAuthenticated());
          }
          element.html(auth.isAnonymous() && '登录' || '注销');
        });
        scope.$on(events.authLogoutSuccess, function () {
          if (conf.debug.auth) {
            console.info('loginDialog listen events.authLogoutSuccess auth.isAuthenticated():', auth.isAuthenticated());
          }
          element.html(auth.isAnonymous() && '登录' || '注销');
        });
        scope.$on(events.authLoginFailed, function () {
          if (conf.debug.auth) {
            console.info('loginDialog listen events.authLoginFailed auth.isAuthenticated():', auth.isAuthenticated());
          }
          element.html(auth.isAnonymous() && '登录' || '注销');
        });

      }
    };
  }
]);
