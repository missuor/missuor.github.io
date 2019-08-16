angular.module('app.urls', [
  'oc.lazyLoad',
  'app.conf',
])

.config(['$ocLazyLoadProvider', 'conf', function ($ocLazyLoadProvider, conf) {
  $ocLazyLoadProvider.config({
    debug: false,
    events: true,
    modules: [{
      name: 'simditor',
      files: [
        { type: 'css', path: conf.staticUrl + '/lazy/simditor/styles/simditor.css' },
        { type: 'js', path: conf.staticUrl + '/lazy/simditor/simditor.js' },
      ]
    }, {
      name: 'angular-local-storage',
      files: [
        { type: 'js', path: conf.staticUrl + '/lazy/angular-local-storage/angular-local-storage.js' },
      ]
    }, {
      name: 'infinite-scroll',
      files: [
        { type: 'js', path: conf.staticUrl + '/lazy/infinite-scroll/infinite-scroll.min.js' },
      ]
    }, {
      name: 'ng-tags-input',
      files: [
        { type: 'css', path: conf.staticUrl + '/lazy/ng-tags-input/styles/ng-tags-input.min.css' },
        { type: 'js', path: conf.staticUrl + '/lazy/ng-tags-input/ng-tags-input.js' },
      ]
    }, {
      name: 'school',
      files: [
        { type: 'css', path: conf.staticUrl + '/css/lazy/school.css' },
      ]
    }, {
      name: 'slotmachine',
      files: [
        { type: 'css', path: conf.staticUrl + '/css/lazy/jquery.slotmachine.style.css' },
        { type: 'css', path: conf.staticUrl + '/lazy/jquery.slotmachine/css/jquery.slotmachine.min.css' },
        { type: 'js', path: conf.staticUrl + '/lazy/jquery.slotmachine/jquery.slotmachine.js' }
      ]
    }, {
      name: 'highlight',
      files: [
        { type: 'css', path: conf.staticUrl + '/lazy/highlight/styles/monokai-sublime.css' },
        { type: 'js', path: conf.staticUrl + '/lazy/highlight/highlight' + (conf.enableDebug ? '' : '.min') + '.js' }
      ]
    }]
  });
}])

.config([

  '$stateProvider', 'conf',

  function ($stateProvider, conf) {
    function loadDeps(deps) {
      return {
        o: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(deps);
        }]
      };
    }

    $stateProvider
      .state('home', {
        url: '',
        controller: 'blogCtrl.list',
        templateUrl: conf.templateUrl + '/blog/list.html',
        resolve: loadDeps(['infinite-scroll'])
      })

    // auth
    .state('auth', {
        abstract: true,
        template: '<ui-view>'
      })
      .state('auth.login', {
        url: '/login?:next',
        controller: 'authCtrl.login',
        templateUrl: conf.templateUrl + '/auth/login.html',
        params: { toParams: {}, next: 'home' }
      })
      .state('auth.logout', {
        url: '/logout',
        controller: 'authCtrl.logout'
      })
      .state('auth.register', {
        url: '/register',
        controller: 'authCtrl.register',
        templateUrl: conf.templateUrl + '/auth/register.html'
      })

    // blog
    .state('blog', {
        abstract: true,
        url: '/blogs',
        template: '<ui-view>',
        resolve: loadDeps(['highlight', 'infinite-scroll'])
      })
      .state('blog.list', {
        url: '/list',
        controller: 'blogCtrl.list',
        templateUrl: conf.templateUrl + '/blog/list.html'
      })
      .state('blog.archives', {
        url: '/archives',
        controller: 'blogCtrl.archives',
        templateUrl: conf.templateUrl + '/blog/archives.html'
      })
      .state('blog.drafts', {
        url: '/drafts',
        controller: 'blogCtrl.drafts',
        templateUrl: conf.templateUrl + '/blog/drafts.html'
      })
      .state('blog.add', {
        url: '/add',
        controller: 'blogCtrl.add',
        templateUrl: conf.templateUrl + '/blog/add.html',
        resolve: loadDeps(['simditor', 'ng-tags-input'])
      })
      .state('blog.delete', {
        url: '/delete/:blogId',
        controller: 'blogCtrl.delete',
        templateUrl: conf.templateUrl + '/blog/delete.html'
      })
      .state('blog.edit', {
        url: '/edit/:blogId',
        controller: 'blogCtrl.edit',
        templateUrl: conf.templateUrl + '/blog/edit.html',
        resolve: loadDeps(['simditor', 'ng-tags-input'])
      })
      .state('blog.detail', {
        url: '/:blogId',
        controller: 'blogCtrl.detail',
        templateUrl: conf.templateUrl + '/blog/detail.html',
        // params: { y: null, m: null, d: null, e: undefined }
      })
      .state('blog.comments', {
        url: '/:blogId/comments',
        controller: 'blogCtrl.comments',
        templateUrl: conf.templateUrl + '/blog/comments.html'
      })

    // Tag
    .state('tag', {
        abstract: true,
        url: '/tags',
        template: '<ui-view>',
        // resolve: loadDeps(['highlight'])
      })
      .state('tag.list', {
        url: '/all',
        templateUrl: conf.templateUrl + '/blog/tag.html',
        controller: 'blogCtrl.tagsGet'
      })
      .state('tag.detail', {
        url: '/:tag',
        templateUrl: conf.templateUrl + '/blog/tag.html',
        controller: 'blogCtrl.tagsGet'
      })

    // Tag
    .state('category', {
        abstract: true,
        url: '/category',
        template: '<ui-view>'
      })
      .state('category.add', {
        url: '/add',
        controller: 'blogCtrl.categoryAdd',
        templateUrl: conf.templateUrl + '/blog/category.add.html'
      })
      .state('category.delete', {
        url: '/delete/:id',
        controller: 'blogCtrl.categoryDelete',
        templateUrl: conf.templateUrl + '/blog/category.delete.html'
      })

    .state('school', { abstract: true, url: '/school', template: '<ui-view>', resolve: loadDeps('school') })
      .state('school.grade', { abstract: true, template: '<ui-view>' })
      .state('school.class', { abstract: true, template: '<ui-view>' })
      .state('school.teacher', { abstract: true, template: '<ui-view>' })

    .state('school.student', { abstract: true, template: '<ui-view>', resolve: loadDeps('slotmachine') })
      .state('school.student.list', {
        url: '/student/list',
        controller: 'studentCtrl.list',
        templateUrl: conf.templateUrl + '/school/list.html'
      })
      .state('school.student.casino', {
        url: '/student/casino',
        controller: 'studentCtrl.choices',
        templateUrl: conf.templateUrl + '/school/casino.html'
      });
  }
]);
