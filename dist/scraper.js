'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); // Requirements

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xRay = require('x-ray');

var _xRay2 = _interopRequireDefault(_xRay);

var _words = require('./words.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var x = (0, _xRay2.default)();

// Scrape Export

var Scraper = (function () {
  function Scraper(config) {
    _classCallCheck(this, Scraper);

    this.url = config.url;
    this.rootSelector = config.rootSelector;
    this.selectors = [config.selectors];
    this.pagination = config.pagination;
    this.limit = config.limit;
    this.customTransforms = config.customTransforms || [];
  }

  _createClass(Scraper, [{
    key: 'jobfilter',
    value: function jobfilter(joblist) {
      return joblist.filter(function (job) {
        var isValidJob = false;
        _words.whitelist.forEach(function (word) {
          if (job.title.toLowerCase().indexOf(word) > -1) {
            isValidJob = true;
            _words.blacklist.forEach(function (badword) {
              if (job.title.toLowerCase().indexOf(badword) > -1) {
                isValidJob = false;
              }
            });
          }
        });
        return isValidJob;
      });
    }
  }, {
    key: 'applyTransforms',
    value: function applyTransforms(joblist) {
      var _this = this;

      return joblist.map(function (job) {
        _this.customTransforms.forEach(function (transform) {
          var result = transform(job.location);
          job[result.property] = result.val;
        });
        return job;
      });
    }
  }, {
    key: 'scrape',
    value: function scrape(callback) {
      var _this2 = this;

      var jobsList = [];
      x(this.url, this.rootSelector, this.selectors)(function (err, result) {
        if (!result) {
          result = [];
        };
        if (err) {
          console.error(err);
        };

        var jobsList = _this2.applyTransforms(_this2.jobfilter(result));
        callback(jobsList);
      }).paginate(this.pagination).limit(this.limit);
    }
  }]);

  return Scraper;
})();

exports.default = Scraper;
