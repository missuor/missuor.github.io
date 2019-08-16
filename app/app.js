(function (angular) {
  var conf = {
    baseUrl: '/',
    apiUrl: '/api',
    staticUrl: '/static',
    templateUrl: '/views',
    imgUpload: {
      url: '/store/ajax-upload/',
      key: 'img'
    },
    enableDebug: true,
    site: {
      header: '/header.html',
      footer: '/footer.html',
      login: '/auth/login.html',
      loginBox: '/auth/login.html',
      html5Mode: false,
    },
    defaults: {
      permissions: ['home', 'blog.list', 'blog.detail', 'auth.login', 'auth.logout', 'auth.register']
    },
    debug: {
      cache: false,
      api: false,
      auth: false,
      blog: false
    }
  };
  var events = {
    broadcastToAll: 'broadcast-to-all',

    httpBadRequest: 'http-badrequest', // 400
    httpUnAuthorized: 'http-unauthorized', // 401+
    httpUnauthenticated: 'http-unauthenticated', // 401
    httpForbidden: 'http-forbidden', // 403
    httpNotFound: 'http-not-found', // 404
    httpMethodNotAllowed: 'http-method-not-allowed', // 405
    httpNotAcceptable: 'http-not-acceptable', // 406
    httpProxyAuthenticationRequired: 'http-proxy-authentication-required', // 407
    httpRequestTimeout: 'http-request-timeout', // 408
    httpConflict: 'http-conflict', // 409
    httpGone: 'http-gone', // 410
    httpLengthRequired: 'http-length-required', // 411
    httpPreconditionFailed: 'http-precondition-failed', // 412
    httpRequestEntityTooLarge: 'http-request-entity-toolarge', // 413
    httpRequestURITooLong: 'http-request-uri-too-long', // 414
    httpUnsupportedMediaType: 'http-unsupported-media-type', // 415
    httpRequestedRangeNotSatisfiable: 'http-requested-range-not-satisfiable', // 416
    httpExpectationFailed: 'http-expectation-failed', // 417
    httpUnprocessableEntity: 'http-unprocessable-entity', // 422
    httpLocked: 'http-locked', // 423
    httpFailedDependency: 'http-failed-dependency', // 424
    httpUnorderedCollection: 'http-unordered-collection', // 425
    httpUpgradeRequired: 'http-upgrade-required', // 426
    httpRetryWith: 'http-retry-with', // 449
    httpInternalServerError: 'http-internal-server-error', // 500
    httpNotImplemented: 'http-not-implemented', // 501
    httpBadGateway: 'http-bad-gateway', // 502
    httperviceUnavailable: 'http-service-unavailable', // 503
    httpGatewayTimeout: 'http-gateway-timeout', // 504

    authLoginSuccess: 'auth-login-success', // 200
    authLoginFailed: 'auth-login-failed', // 200
    authLogoutSuccess: 'auth-logout-success', // 204
    authLogoutFailed: 'auth-logout-failed', // 204
    authSessionTimeout: 'auth-session-timeout', // 419

    repeatFinished: 'ng-repeat-finished',
  };

  var globals = {
    user: {}
  };

  if (window) {
    conf = angular.merge({}, conf, window.env);
    globals = angular.merge({}, conf, globals);
  }

  angular.isEmptyObject = function (obj) {
    for (var name in obj) {
      return false;
    }
    return true;
  };

  angular.module('app.conf', []).constant('conf', conf);
  angular.module('app.events', []).constant('events', events);

  angular.module('app', [
    'ui.router',
    'ui-notification',
    'app.conf',
    'app.urls',
    'app.interceptors',
    'app.directives',
    'app.services.auth',
    'app.controllers.auth',
    'app.controllers.blog',
    'app.controllers.school'
  ])

  .config(['$logProvider', 'conf',
    function disableLogging($logProvider, conf) {
      $logProvider.debugEnabled(conf.enableDebug);
    }
  ])

  .config(function (NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 3000,
      replaceMessage: true,
      startTop: 0,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'center',
      positionY: 'top'
    });
  })

  .config(['$httpProvider', '$locationProvider', 'conf',
    function ($httpProvider, $locationProvider, conf) {
      $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
      $httpProvider.defaults.headers.common.Authorization = true;
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
      $httpProvider.defaults.withCredentials = true;
      $locationProvider.html5Mode(conf.site.html5Mode);
    }
  ])

  .run([

    '$rootScope', '$state', '$stateParams', 'auth', 'Notification',

    function ($rootScope, $state, $stateParams, auth, Notification) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.globals = globals;
      $rootScope.Notify = Notification;

      auth.init().then(function () {
        $rootScope.globals.user = auth.getUser();
        $rootScope.globals.inited = true;
        if (auth.isAuthenticated()) {
          // $rootScope.Notify.success('Welcome! ' + auth.getUser().full_name);
          $rootScope.$broadcast(events.authLoginSuccess);
        } else {
          $rootScope.$broadcast(events.authLoginFailed);
        }
      });
      $rootScope.$on('$stateChangeSuccess', function () {
        window.scrollTo(0, 0);
      });
      $state.go('home');
    }
  ])

  .run([

    '$rootScope', '$state', 'events', 'auth', 'conf',

    function ($rootScope, $state, events, auth, conf) {
      $rootScope.$on('$stateChangeStart', function (event, toParams, from, fromParams, options) {
        if (!!$rootScope.globals.inited && !auth.isAuthorized(toParams.name)) {
          event.preventDefault();
          if (!auth.isAuthenticated()) {
            if (conf.enableDebug) {
              console.log('events.httpUnauthenticated');
            }
            $rootScope.Notify.error('httpUnauthenticated');
            $rootScope.$broadcast(events.httpUnauthenticated); // 401
            $state.go('auth.login', { next: toParams.name, toParams: from });
          } else {
            if (conf.enableDebug) {
              console.log('events.httpForbidden');
            }
            $rootScope.Notify.error('httpForbidden');
            $rootScope.$broadcast(events.httpForbidden); // 403
          }
        }
      });

      $rootScope.$on(events.broadcastToAll, function (event, signal) {
        $rootScope.$broadcast(signal);
      });

      function authorizedChangeHandle(event, signal) {
        $rootScope.globals.user = auth.getUser();
        if (!auth.isAuthorized($rootScope.$state.current.name)) {
          event.preventDefault();
          if (!auth.isAuthenticated()) {
            if (conf.enableDebug) {
              console.log('events.httpUnauthenticated');
            }
            // $rootScope.Notify.error('httpUnauthenticated');
          } else {
            if (conf.enableDebug) {
              console.log('events.httpForbidden');
            }
            // $rootScope.Notify.error('httpForbidden');
          }
          $state.go('auth.login', { next: $rootScope.$state.current.name, toParams: $rootScope.$stateParams });
        } else if (['auth.login', 'auth.logout'].indexOf($rootScope.$state.current.name) !== -1) {
          $state.go($rootScope.$state.params.next || 'home', $rootScope.$state.params.toParams);
        }
      }

      $rootScope.$on(events.httpUnAuthorized, authorizedChangeHandle);
      $rootScope.$on(events.authLogoutSuccess, authorizedChangeHandle);
      $rootScope.$on(events.authLoginSuccess, authorizedChangeHandle);
      $rootScope.$on(events.authLoginFailed, authorizedChangeHandle);
    }
  ]);

})(angular);
