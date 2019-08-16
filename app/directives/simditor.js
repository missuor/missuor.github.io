(function (window, angular, undefined) {
  'use strict';
  var m = angular.module('ngSimditor', [
    'app.conf',
    'app.services.auth',
  ]);

  m.directive('simditorComment', function () {

    var TOOLBAR_DEFAULT = ['bold', 'underline', '|', 'ol', 'ul', 'code', '|', 'link', 'image', 'emoji'];
    var EMOJI_DEFAULT = {
      imagePath: conf.staticUrl + '/lazy/simditor/emoji/'
    };

    return {
      require: "?^ngModel",
      scope: {
        addComment: '=',
        addReply: '=',
        sub: '=',
        comment: '='
      },
      link: function (scope, element, attrs, ngModel) {
        element.on('click ', function (e) {
            if (scope.simditor) {
              return;
            } else {
              element.html('<p></p>');
              element.removeClass('fake-textarea');
              element.next().removeClass('hide');
              element.next().find('.btn-cancel-create-comment').on('click', function () {
                element.addClass('fake-textarea');
                element.next().addClass('hide');
                if (scope.simditor) {
                  scope.simditor.destroy();
                }
                scope.simditor = null;
                element.html('点击发表评论');
              });
            }

            var toolbar = scope.$eval(attrs.toolbar) || TOOLBAR_DEFAULT;
            var emoji = scope.$eval(attrs.emoji) || EMOJI_DEFAULT;
            scope.simditor = new window.Simditor({
              textarea: element.children()[0],
              pasteImage: true,
              toolbar: toolbar,
              emoji: emoji,
              defaultImage: 'assets/images/image.png',
              upload: location.search === '?upload' ? {
                url: conf.apiUrl + conf.imgUpload.url,
                fileKey: conf.imgUpload.key,
                params: {
                  'csrfmiddlewaretoken': auth.getToken()
                }
              } : false
            });
            scope.simditor.focus();
            var $target = element.find('.simditor-body');

            function readViewText() {
              ngModel.$setViewValue($target.html());
              if (attrs.ngRequired !== undefined && attrs.ngRequired !== "false") {
                var text = $target.text();
                if (text.trim() === "") {
                  ngModel.$setValidity("required", false);
                } else {
                  ngModel.$setValidity("required", true);
                }
              }
            }

            ngModel.$render = function () {
              scope.simditor.focus();
              $target.html(ngModel.$viewValue || '<p></p>');
            };

            scope.simditor.on('valuechanged', function () {
              scope.$apply(readViewText);
            });
          })
          .on('keydown ', function (e) {
            if (e.keyCode == 17 && e.ctrlKey) {
              if (!!ngModel.$viewValue) {
                scope.addReply(scope.sub, scope.comment);
              } else if (!!scope.comment) {
                scope.addReply(scope.comment);
              } else {
                scope.addComment();
              }
            }
          });
      }
    };
  });

  m.directive('simditorTextarea', ['conf', 'auth', function (conf, auth) {

    var TOOLBAR_DEFAULT = [
      'title', 'bold', 'italic', 'underline', 'strikethrough', 'color', '|',
      'ol', 'ul', 'blockquote', 'code', 'table', '|',
      'link', 'image', 'hr', '|',
      'indent', 'outdent', 'emoji',
      //'fullscreen'
    ];
    var EMOJI_DEFAULT = {
      imagePath: conf.staticUrl + '/lazy/simditor/emoji/'
    };
    var mobileToolbar = ["bold", "underline", "strikethrough", "color", "ul", "ol"];
    return {
      require: "?^ngModel",

      link: function (scope, element, attrs, ngModel) {
        element.append("<textarea></textarea>");
        var toolbar = scope.$eval(attrs.toolbar) || TOOLBAR_DEFAULT;
        var emoji = scope.$eval(attrs.emoji) || EMOJI_DEFAULT;
        var value;
        scope.simditor = new window.Simditor({
          textarea: element.children()[0],
          pasteImage: true,
          placeholder: '这里输入文字...',
          toolbar: toolbar,
          emoji: emoji,
          defaultImage: '/dist/lazy/simditor/emoji/four_leaf_clover.png',
          autosavePath: location.pathname + 'autosave', //'+new Date().getTime(),
          allowedAttributes: {
            table: ['class']
          },
          upload: {
            url: conf.apiUrl + conf.imgUpload.url,
            fileKey: conf.imgUpload.key,
            params: {
              'csrfmiddlewaretoken': auth.getToken()
            }
          },
        });
        ngModel.$render = function () {
          scope.simditor.setValue(ngModel.$viewValue || '');
          scope.simditor.focus();
        };

        scope.simditor.on('valuechanged', function () {
          element.find('.simditor-body table').addClass('table table-bordered table-hover');
          ngModel.$setViewValue(scope.simditor.getValue());
          if (attrs.ngRequired !== undefined && attrs.ngRequired !== "false") {
            var text = scope.simditor.getValue();

            if (text.trim() === "") {
              ngModel.$setValidity("required", false);
            } else {
              ngModel.$setValidity("required", true);
            }
          }
        });
      }
    };
  }]);

})(window, angular || window.angular);
