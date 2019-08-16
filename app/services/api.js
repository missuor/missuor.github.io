angular.module('app.services.api', [
  'app.conf',
  'app.services.cache'
])

.service('api', [

  '$http', '$q', '$sce', 'conf', 'cache',

  function ($http, $q, $sce, conf, cache) {
    this.get = function (url, kw) {
      var deferred = $q.defer();
      var params = kw && kw.params;
      var cachekey = url + (cache.hashKey(params) || '');
      cachevalue = cache.get(cachekey);
      if (cachevalue && kw.cache !== false) {
        if (conf.debug.cache) {
          console.info('get from cache, cachekey:', cachekey, 'cachevalue:', cachevalue);
        }
        var data = kw && kw.cb ? kw.cb(cachevalue) : cachevalue;
        deferred.resolve(data);
      } else {

    //     $http.jsonp(conf.apiUrl + url + '?callback=JSON_CALLBACK1').then(function(data) {
    //     　　console.debug('api.jsonp success', url, data);
    //     }).error(function(data, status, headers, config) {
    //     console.debug('api.jsonp error', url, data);
    // });;


        $http.get(conf.apiUrl + url, { 'params': params })
          .then(function (resp) {
            if (kw.cache !== false) {
              cache.set(cachekey, resp.data);
            }
            resp.data = kw && kw.cb ? kw.cb(resp.data) : resp.data || resp.data;
            if (conf.debug.api) {
              console.debug('api.get success', url, resp);
            }
            deferred.resolve(resp.data);
          }, function (resp) {
            if (conf.debug.api) {
              console.debug('api.get failed', url, resp);
            }
            deferred.reject(resp.data);
          });
      }

      return deferred.promise;
    };

    this.post = function (url, kw) {
      var deferred = $q.defer();
      $http.post(conf.apiUrl + url, { 'obj': kw.data })
        .then(function (resp) {
          if (conf.debug.api) {
            console.debug('api.post success', url, resp);
          }
          deferred.resolve(resp.data);
        }, function (resp) {
          if (conf.debug.api) {
            console.debug('api.post failed', url, resp);
          }
          deferred.reject(resp.data);
        });
      return deferred.promise;
    };

    this.put = function (url, kw) {
      var deferred = $q.defer();
      $http.put(conf.apiUrl + url, { 'obj': kw.data })
        .then(function (resp) {
          if (conf.debug.api) {
            console.debug('api.put success', url, resp);
          }
          resp.data = kw && kw.cb ? kw.cb(resp.data) : resp.data || resp.data;
          return deferred.resolve(resp.data);
        }, function (resp) {
          if (conf.debug.api) {
            console.debug('api.put failed', url, resp);
          }
          return deferred.reject(resp.data);
        });
      return deferred.promise;
    };

    this.delete = function (url, kw) {
      var deferred = $q.defer();
      $http.delete(conf.apiUrl + url)
        .then(function (resp) {
          if (conf.debug.api) {
            console.debug('api.delete success', url, resp);
          }
          resp.data = kw && kw.cb ? kw.cb(resp.data) : resp.data || resp.data;
          deferred.resolve(resp.data);
        }, function (resp) {
          if (conf.debug.api) {
            console.debug('api.delete failed', url, resp);
          }
          deferred.reject(resp.data);
        });
      return deferred.promise;
    };
  }
]);
