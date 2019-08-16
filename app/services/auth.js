angular.module('app.services.auth', [
  'ngCookies',
  'app.conf',
  'app.services.api'
])

.service('auth', [

  '$q', '$cookies', 'api', 'conf',

  function ($q, $cookies, api, conf) {
    var vm = this;
    var csrftoken, user = {};

    this.info = function () {
      var deferred = $q.defer();
      api.get('/auth/', { 'cache': false }).then(function (data) {
        user = data.user;
        csrftoken = data.csrftoken || $cookies.get('csrftoken');
        $cookies.put('csrftoken', csrftoken);
        deferred.resolve(data);
      }, function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    };

    this.init = function () {
      if (conf.apiUrlProxy) {
        var deferred = $q.defer();
        api.get(conf.apiUrlProxy, { 'cache': false }).then(function () {
          deferred.resolve(vm.info());
        }, function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
      } else {
        return vm.info();
      }
    };

    this.login = function (data) {
      var deferred = $q.defer();
      $cookies.put('backend', 'missuor');
      api.post('/auth/login/', { 'data': data, 'cache': false })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('auth.login success. data:', data, 'cookies:', document.cookies);
          }
          user = data.user;
          csrftoken = data.csrftoken;
          $cookies.put('csrftoken', csrftoken);
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.logout = function () {
      var deferred = $q.defer();
      api.delete('/auth/', { 'cache': false })
        .then(function (data) {
          user = {};
          csrftoken = data.csrftoken || $cookies.get('csrftoken');
          $cookies.remove('csrftoken');
          if (conf.debug.auth) {
            console.log('auth.logout success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          if (conf.debug.auth) {
            console.log('auth.logout failure');
          }
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.register = function () {

    };

    this.getUser = function () {
      return user;
    };

    this.getToken = function () {
      return csrftoken || $cookies.get('csrftoken');
    };

    this.isAnonymous = function () {
      return angular.isEmptyObject(user);
    };

    this.isAuthorized = function (permissions) {
      var user_permissions = new Set(user.user_permissions);
      var has_perm = false;
      conf.defaults.permissions.map(function (p) { user_permissions.add(p); });
      if (angular.isArray(permissions)) {
        has_perm = !permissions.some(function (p) {
          return user_permissions.has(p);
        });

      } else if (!angular.isEmptyObject(permissions)) {
        has_perm = user_permissions.has(permissions);
      }
      if (conf.debug.auth) {
        console.log('auth.isAuthorized(' + permissions + '):', vm.isAuthenticated() && user.is_active && user.is_superuser || has_perm, 'user_permissions:', user_permissions);
      }
      return user.is_superuser || has_perm;
    };

    this.isAuthenticated = function () {
      return !angular.isEmptyObject(user);
    };
  }
]);
