angular.module('app.services.cache', [
  'app.conf',
  'LocalStorageModule',
])

.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('missuor')
    // .setStorageType('sessionStorage')
    .setNotify(true, true);
})

.service('cache', [

  'localStorageService', 'conf',

  function (localStorageService, conf) {
    var vm = this;
    this.setPrefix = localStorageService.setPrefix;
    this.setStorageType = localStorageService.setStorageType;
    this.setDefaultToCookie = localStorageService.setDefaultToCookie;
    this.setStorageCookie = localStorageService.setStorageCookie;
    this.setStorageCookieDomain = localStorageService.setStorageCookieDomain;
    this.setNotify = localStorageService.setNotify;
    this.Example = localStorageService.Example;
    this.isSupported = localStorageService.isSupported;
    this.getStorageType = localStorageService.getStorageType;
    this._set = localStorageService.set;
    this._get = localStorageService.get;
    this.keys = localStorageService.keys;
    this.remove = localStorageService.remove;
    this.clearAll = localStorageService.clearAll;
    this.bind = localStorageService.bind;
    this.deriveKey = localStorageService.deriveKey;
    this.length = localStorageService.length;
    this.cookie = localStorageService.cookie;
    this.set = function (key, value, expire) {
      if (conf.enableCache) {
        var expire_seconds = Number.isInteger(expire) && expire || 10; // a week
        vm._set(key, { 'value': value, 'expire': vm.timestamp() + expire_seconds });
      }
    };
    this.get = function (key) {
      if (!conf.enableCache) {
        return null;
      }
      var data = vm._get(key);
      if (data && data.expire && data.expire < this.timestamp()) {
        return data.value;
      } else if (data) {
        vm.remove(key);
      }
    };
    this.timestamp = function () {
      return Date.parse(new Date()) / 1000;
    };
    this.hashKey = function (obj) {
      if (!angular.isEmptyObject(obj)) {
        var hash = angular.isArray(obj) ? 　obj.join('-') : Object.keys(obj).sort().map(function (k) {
          return obj[k];
        }).join('-');
        if (conf.debug.cache) {
          console.log('hashKey', hash);
        }
        return hash;
      }
    };
  }
]);
