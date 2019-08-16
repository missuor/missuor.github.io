angular.module('app.controllers.school', [
  'ngSlotmachine',
  'app.conf',
  'app.services.school'
])

.controller('studentCtrl.list', ['$scope', 'schoolService', 'conf',
  function ($scope, schoolService, conf) {
    $scope.show_header = false;
    schoolService.lstStudent().then(function (resp) {
      $scope.students = resp.data.records;
      $scope.page_info = resp.data.page_info;
      $scope.infinite = conf.site.useinfinite && true;
      $scope.loading = false;
      $scope.currentpage = 1;
    });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.school) {
          console.log('studentCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        schoolService.lstStudent({ page: $scope.currentpage, cache_prefix: 'students', limit: 9 }).then(function (resp) {
          if (conf.debug.school) {
            console.log('studentCtrl.list loadMore finished. page_info:', resp.data.page_info);
          }
          $scope.students = $scope.students.concat(resp.data.records);
          $scope.page_info = resp.data.page_info;
          $scope.loading = false;
        });
      }
    };
  }
])

.controller('studentCtrl.detail', ['$scope', '$stateParams', '$state', 'schoolService',
  function ($scope, $stateParams, $state, schoolService) {
    schoolService.getStudent($stateParams.studentId).then(function (resp) {
      $scope.student = resp.data.record;
    });
  }
])

.controller('studentCtrl.add', ['$scope', 'schoolService', 'conf', '$state',
  function ($scope, schoolService, conf, $state) {
    schoolService.getStudent('act/initial').then(function (resp) {
      $scope.student = resp.data.record;
    }, function (resp) {
      if (conf.debug.school) {
        console.log('studentCtrl.add failure. resp:', resp);
      }
      $scope.errors = resp.data.errors;
    });
    $scope.errors = {};
    $scope.student = {
      title: '',
      content: '',
      owner: null,
      tags: [],
      is_publish: true,
      is_public: true
    };
    schoolService.lstStudent().then(function (resp) {
      $scope.drafts = resp.data.records;
      $scope.page_info = resp.page_info;
    });

    $scope.saveBlog = function () {
      $scope.student.tags = $scope.student.tags.map(function (tag) {
        return tag.text;
      });
      schoolService.addStudent($scope.student)
        .then(function (obj) {
          if (conf.debug.school) {
            console.log('blog.add success, obj:', obj);
          }
          $state.go('blog.detail', obj.stateParams);
        }, function (resp) {
          if (conf.debug.school) {
            console.log('blog.add failure, resp:', resp);
          }
          $scope.errors = resp.data.errors;
        });
    };
  }

])

.controller('studentCtrl.edit', ['$scope', '$stateParams', '$state', 'schoolService',
  function ($scope, $stateParams, $state, schoolService) {
    $scope.errors = {};
    schoolService.getStudent($stateParams.studentId)
      .then(function (resp) {
        $scope.student = resp.data.record;
      });

    $scope.save = function () {
      $scope.student.tags = $scope.student.tags.map(function (tag) {
        return tag.name;
      });
      schoolService.modStudent($scope.student.id, $scope.student)
        .then(function (resp) {
          $state.go('blog.detail', resp.data.record.stateParams);
        }, function (resp) {
          if (conf.debug.school) {
            console.log('blog.edit failure, resp:', resp);
          }
          $scope.errors = resp.data.errors;
        });
    };
  }
])

.controller('studentCtrl.delete', ['$scope', 'schoolService',
  function ($scope, schoolService) {

  }
])

.controller('studentCtrl.choices', ['$scope', 'schoolService', 'conf',
  function ($scope, schoolService, conf) {
    $scope.show_header = false;
    schoolService.lstStudent().then(function (resp) {
      $scope.choices = resp.data.records;
      $scope.title = "时光老虎机";
      $scope.page_info = resp.data.page_info;
      $scope.infinite = conf.site.useinfinite && true;
      $scope.loading = false;
      $scope.currentpage = 1;
    });

    $scope.loadMore = function () {
      if ($scope.loading) {
        if (conf.debug.school) {
          console.log('studentCtrl.list loading...');
        }
        return false;
      } else {
        $scope.loading = true;
        $scope.currentpage += 1;
        if ($scope.currentpage > $scope.page_info.num_pages) {
          $scope.infinite = conf.site.useinfinite && false;
          return false;
        }
        schoolService.lstStudent({ page: $scope.currentpage, cache_prefix: 'students', limit: 9 }).then(function (resp) {
          if (conf.debug.school) {
            console.log('studentCtrl.list loadMore finished. page_info:', resp.data.page_info);
          }
          $scope.choices = $scope.choices.concat(resp.data.records);
          $scope.page_info = resp.data.page_info;
          $scope.loading = false;
        });
      }
    };
  }
]);
