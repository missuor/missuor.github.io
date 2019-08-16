angular.module('app.services.school', [
  'app.services.api'
])

.service('schoolService', [

  '$sce', 'api',

  function ($sce, api) {
    var vm = this;
    this.callback = function (data) {
      if (!angular.isEmptyObject(data.records)) {
        angular.forEach(data.records, function (o) {
          vm.callback(o);
        });
      } else if (!angular.isEmptyObject(data.record)) {
        vm.callback(data.record);
      } else {
        // data.create_time = data.create_time ? new Date(data.create_time.replace(/-/g, '/')) : null;
        // data.content = typeof (data.content) == "string" ? $sce.trustAsHtml(data.content) : data.content;
        // data.stateParams = {
        //   blogId: data.entryname || data.id,
        //   y: data.create_time && data.create_time.getFullYear(),
        //   m: data.create_time && data.create_time.getMonth() + 1,
        //   d: data.create_time && data.create_time.getDate()
        // };
      }
      return data;
    };

    this.lstStudent = function (kwargs) {
      var limit = kwargs && kwargs.limit || 9;
      var page = kwargs && kwargs.page || 1;
      return api.get('/school/students/?limit=' + limit + '&p=' + page, { 'cb': vm.callback });
    };

    this.getStudent = function (obj_id) {
      return api.get('/school/students/' + obj_id, { 'cb': vm.callback });
    };

    this.addStudent = function (data) {
      return api.post('/school/students/', { 'cb': vm.callback, 'data': data });
    };

    this.delStudent = function (obj_id) {
      return api.delete('/school/students/' + obj_id);
    };

    this.modStudent = function (obj_id, data) {
      return api.put('/school/students/' + obj_id, { 'cb': vm.callback, 'data': data });
    };
  }
]);
