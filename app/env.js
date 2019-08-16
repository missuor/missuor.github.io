(function (window) {
  window.env = window.env || {};

  // API url
  window.env.apiUrl = 'http://bbt.os-easy.com';
  // window.env.apiUrl = 'http://127.0.0.1:8000';

  window.env.apiUrlProxy = '/to/missuor';

  // Base url
  window.env.baseUrl = '/';

  // Static url
  window.env.staticUrl = '/dist';

  // template Url
  window.env.templateUrl = '/app/views';

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.env.enableDebug = true;

  window.env.enableHttpDebug = true;

  window.env.site = {};

  window.env.site.header = '/header.html';

  window.env.site.footer = false;

  window.env.site.useinfinite = true;

  // $.getScript('../dist/js/wave.js', function () {})
  // $.getScript('http://www.hakim.se/experiments/html5/wave/03/js/hakim.wave.js', function () {})
  window.paceOptions = {
    document: true, // disabled
    eventLag: true,
    elements: false,
    restartOnRequestAfter: false,
    ajax: {
      trackMethods: ['POST', 'GET']
    }
  };
}(this));
