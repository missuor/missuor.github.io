angular.module('app.controllers.blog', [
  'ngSimditor',
  'app.conf',
  'app.services.blog',
])

.controller('blogCtrl.list', ['$scope', 'blogService', 'conf',
  function ($scope, blogService, conf) {
    blogService.lstBlog({ params: {} }).then(function (data) {
      $scope.blogs = data.records;
      $scope.page_info = data.page_info;
      $scope.infinite = conf.site.useinfinite && true;
      $scope.loading = false;
      $scope.currentpage = 1;
    });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.blog) {
          console.log('blogCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        blogService.lstBlog({ 'params': { 'page': $scope.currentpage, 'cache_prefix': 'blogs', 'limit': 9 } })
          .then(function (data) {
            if (conf.debug.blog) {
              console.log('blogCtrl.list loadMore finished. page_info:', data.page_info);
            }
            $scope.blogs = $scope.blogs.concat(data.records);
            $scope.page_info = data.page_info;
            $scope.loading = false;
          });
      }
    };
  }
])

.controller('blogCtrl.archives', ['$scope', 'blogService', 'conf',
  function ($scope, blogService, conf) {
    blogService.lstArchives({ params: {} }).then(function (data) {
      $scope.archives = data.records;
      $scope.page_info = data.page_info;
      $scope.infinite = conf.site.useinfinite && true;
      $scope.loading = false;
      $scope.currentpage = 1;
    });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.blog) {
          console.log('blogCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        blogService.lstBlog({ 'params': { 'page': $scope.currentpage, 'cache_prefix': 'blogs', 'limit': 9 } })
          .then(function (data) {
            if (conf.debug.blog) {
              console.log('blogCtrl.list loadMore finished. page_info:', data.page_info);
            }
            $scope.blogs = $scope.blogs.concat(data.records);
            $scope.page_info = data.page_info;
            $scope.loading = false;
          });
      }
    };
  }
])

.controller('blogCtrl.drafts', ['$scope', 'blogService', 'conf',
  function ($scope, blogService, conf) {
    blogService.lstBlog({ 'params': { 'page': 1, 'cache_prefix': 'blogs-drafts', 'limit': 15, 'is_publish': false } }).then(function (data) {
      $scope.blogs = data.records;
      $scope.page_info = data.page_info;
      $scope.infinite = conf.site.useinfinite && true;
      $scope.loading = false;
      $scope.currentpage = 1;
    });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.blog) {
          console.log('blogCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        blogService.lstBlog({ 'params': { 'page': $scope.currentpage, 'cache_prefix': 'blogs-drafts', 'limit': 15, 'is_publish': false } }).then(function (data) {
          if (conf.debug.blog) {
            console.log('blogCtrl.list loadMore finished. page_info:', data.page_info);
          }
          $scope.blogs = $scope.blogs.concat(data.records);
          $scope.page_info = data.page_info;
          $scope.loading = false;
        });
      }
    };
  }
])

.controller('blogCtrl.detail', ['$scope', '$stateParams', '$state', 'blogService',
  function ($scope, $stateParams, $state, blogService) {
    blogService.getBlog($stateParams.blogId).then(function (data) {
      $scope.blog = data.record;
    }).then(function () {
      angular.element(function () {
        $('pre code').each(function (i, block) {
          hljs.highlightBlock(block);
        });
      });
    });
  }
])

.controller('blogCtrl.add', ['$scope', 'blogService', 'conf', '$state',
  function ($scope, blogService, conf, $state) {
    blogService.getBlog('act/initial').then(function (data) {
      $scope.blog = data.record;
    }, function (data) {
      if (conf.debug.blog) {
        console.log('blogCtrl.add failure. data:', data);
      }
      $scope.errors = data.errors;
    });
    $scope.errors = {};
    $scope.blog = {
      title: '',
      content: '',
      owner: null,
      tags: [],
      is_publish: true,
      is_public: true
    };
    blogService.lstBlog().then(function (data) {
      $scope.drafts = data.records;
      $scope.page_info = data.page_info;
    });

    $scope.saveBlog = function () {
      $scope.blog.tags = $scope.blog.tags.map(function (tag) {
        return tag.text;
      });
      blogService.addBlog($scope.blog)
        .then(function (obj) {
          if (conf.debug.blog) {
            console.log('blog.add success, obj:', obj);
          }
          $state.go('blog.detail', obj.stateParams);
        }, function (data) {
          if (conf.debug.blog) {
            console.log('blog.add failure, data:', data);
          }
          $scope.errors = data.errors;
        });
    };
  }

])

.controller('blogCtrl.edit', ['$scope', '$stateParams', '$state', 'blogService',
  function ($scope, $stateParams, $state, blogService) {
    $scope.errors = {};
    blogService.getBlog($stateParams.blogId)
      .then(function (data) {
        $scope.blog = data.record;
      });

    $scope.save = function () {
      $scope.blog.tags = $scope.blog.tags.map(function (tag) {
        return tag.name;
      });
      blogService.modBlog($scope.blog.id, $scope.blog)
        .then(function (data) {
          $state.go('blog.detail', data.record.stateParams);
        }, function (data) {
          if (conf.debug.blog) {
            console.log('blog.edit failure, data:', data);
          }
          $scope.errors = data.errors;
        });
    };
  }
])

.controller('blogCtrl.delete', ['$scope', 'blogService',
  function ($scope, blogService) {

  }
])

.controller('blogCtrl.tagsGet', ['$scope', '$stateParams', 'blogService', 'conf',
  function ($scope, $stateParams, blogService, conf) {
    var tag = $stateParams.tag;
    blogService.lstBlog({ 'cache_prefix': tag, 'params': { 'page': 1, 'limit': 15, 'tag': tag } })
      .then(function (data) {
        $scope.blogs = data.records;
        $scope.page_info = data.page_info;
        $scope.infinite = conf.site.useinfinite && true;
        $scope.loading = false;
        $scope.currentpage = 1;
      });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.blog) {
          console.log('blogCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        blogService.lstBlog({ 'cache_prefix': tag, 'params': { 'page': $scope.currentpage, 'limit': 15, 'tag': tag } })
          .then(function (data) {
            if (conf.debug.blog) {
              console.log('blogCtrl.list loadMore finished. page_info:', data.page_info);
            }
            $scope.blogs = $scope.blogs.concat(data.records);
            $scope.page_info = data.page_info;
            $scope.loading = false;
          });
      }
    };
  }
]);
