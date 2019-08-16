angular.module('app.services.blog', [
  'app.conf',
  'app.services.api',
  // 'app.services.comment',
  // 'app.services.vote'
])

.service('blogService', [

  '$sce', '$q', 'api', 'conf',

  function ($sce, $q, api, conf) {
    var vm = this;
    this.callback = function (data) {
      if (!angular.isEmptyObject(data.records)) {
        angular.forEach(data.records, function (o) {
          vm.callback(o);
        });
      } else if (!angular.isEmptyObject(data.record)) {
        vm.callback(data.record);
      } else {
        data.create_time = data.create_time ? new Date(data.create_time.replace(/-/g, '/')) : null;
        data.content = typeof (data.content) == "string" ? $sce.trustAsHtml(data.content) : data.content;
        data.stateParams = {
          blogId: data.entryname || data.id,
          y: data.create_time && data.create_time.getFullYear(),
          m: data.create_time && data.create_time.getMonth() + 1,
          d: data.create_time && data.create_time.getDate()
        };
      }
      return data;
    };

    this.lstBlog = function (kwargs) {
      var deferred = $q.defer();
      var params = kwargs && kwargs.params || {};
      api.get('/blogs/', { params: params, 'cb': vm.callback })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.lstBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.lstArchives = function (kwargs) {
      var deferred = $q.defer();
      var params = kwargs && kwargs.params || {};
      api.get('/blogs/act/archives/', {
          params: params,
          'cb': function (data) {
            angular.forEach(data.records, function (o) {
              vm.callback(o);
            });
            return data;
          }
        })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.lstBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.getBlog = function (obj_id) {
      var deferred = $q.defer();
      api.get('/blogs/' + obj_id, { 'cb': vm.callback })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.lstBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.addBlog = function (data) {
      var deferred = $q.defer();
      api.post('/blogs/', { 'cb': vm.callback, 'data': data })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.addBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.modBlog = function (obj_id, data) {
      var deferred = $q.defer();
      api.put('/blogs/' + obj_id, { 'cb': vm.callback, 'data': data })
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.addBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    this.delBlog = function (obj_id) {
      var deferred = $q.defer();
      api.delete('/blogs/' + obj_id)
        .then(function (data) {
          if (conf.debug.auth) {
            console.log('blog.addBlog success. data:', data);
          }
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };
  }
]);
