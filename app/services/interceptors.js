angular.module('app.interceptors', ['ngDialog', 'app.conf', 'app.events'])

// 时间戳
.factory('timestampMarker', ['conf',

    function (conf) {
      var timestampMarker = {
        request: function (config) {
          config.requestTimestamp = new Date().getTime();
          return config;
        },
        response: function (response) {
          response.config.responseTimestamp = new Date().getTime();
          if (conf.enableDebug) {
            var time = response.config.responseTimestamp - response.config.requestTimestamp;
            console.debug('Time: ' + (time / 1000).toFixed(4), 'Url:', response.config.url);
          }
          return response;
        }
      };
      return timestampMarker;
    }
  ])
  .config(['$httpProvider', function ($httpProvider) {
    // $httpProvider.interceptors.push('timestampMarker');
  }])

// Session 注入
.factory('sessionInjector', ['$injector', 'conf', function ($injector, conf) {
    var sessionInjector = {
      request: function (config) {
        if (['POST', 'PUT', 'DELETE'].indexOf(config.method) !== -1) {
          var auth = $injector.get('auth');
          config.headers['X-CSRFToken'] = auth.getToken();
          if (conf.debug.auth) {
            console.log('sessionInjector auth.getToken():', auth.getToken());
          }
        }
        return config;
      },
    };
    return sessionInjector;
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('sessionInjector');
  }])

// HTTP请求拦截
.factory('HttpInterceptor', [

    '$rootScope', '$q', '$injector', 'conf', 'events',

    function ($rootScope, $q, $injector, conf, events) {
      return {
        responseError: function (response) {
          if ([403, 419, 440, 500].indexOf(response.status) !== -1) {
            $rootScope.$broadcast({
              401: events.httpUnauthenticated,
              403: events.httpForbidden,
              419: events.authSessionTimeout,
              440: events.authSessionTimeout,
              500: events.httpInternalServerError
            }[response.status], response);

          } else if (response.status === 401) {
            if (conf.debug.auth) {
              console.log('HttpInterceptor at:', $rootScope.$state.current.name);
            }
            var auth = $injector.get('auth');
            var ngDialog = $injector.get('ngDialog');
            var $http = $injector.get('$http');
            var deferred = $q.defer();
            var dialog = ngDialog.open({
              template: conf.templateUrl + '/auth/login.html',
              controller: 'authCtrl.login',
              className: 'ngdialog-theme-plain',
              appendClassName: 'login',
              showClose: false,
              data: response
            });

            $rootScope.$on('ngDialog.opened', function () {
              setTimeout(function () {
                angular.element('.login input').each(function () {
                  $(this).attr("readonly", false);
                });
              }, 100);
            });
            $rootScope.$on(events.authLoginSuccess, function () {
              dialog.close(dialog.id);
            });
            dialog.closePromise.then(deferred.resolve, deferred.reject);
            return deferred.promise.then(function (resp) {
              if (auth.isAuthenticated()) {
                return $http(response.config);
              } else {
                return deferred.reject(resp);
              }
            });
          } else if (response.status >= 500) {
            if (conf.debug.auth) {
              console.log('HttpInterceptor at:', $rootScope.$state.current.name);
            }
            $rootScope.Notify.error(response.data.msg || 'Internal Server Error');
          }
          return $q.reject(response);
        }
      };
    }
  ])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptor');
  });
