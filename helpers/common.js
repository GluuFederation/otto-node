var request = require('request-promise');
var JSPath = require('jspath');

exports.generateUUID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

exports.jsPathFilter = function (filters, object) {
  var list = filters.split(",");
  var data = {};

  list.forEach(function (item) {
    var filterData = JSPath.apply(item, object);
    data[item.substr(1, item.length)] = filterData;
  });

  return data;
};

exports.depth = function (obj, depth) {
  var depths = depth.split(",");
  var len = depths.length;
  var cnt = 0;
  return new Promise(function (resolve, reject) {
    depths.forEach(function (item) {
      return fetchDepth(obj[item])
        .then(function (response) {
          obj[item] = response;
          cnt += 1;
          if (cnt == len) {
            return resolve(obj);
          }
        })
        .catch(function (error) {
          return reject(error);
        });
    });
  });
};

function fetchDepth(obj) {
  if (Array.isArray(obj)) {
    return fetchDepthForArray(obj);
  } else {
    return fetchDepthForObject(obj);
  }
};

function fetchDepthForArray(list) {
  return new Promise(function (resolve, reject) {
    if (!list) {
      return reject(['Invalid depth parameter']);
    }
    var arr = [];
    var len = list.length;
    var cnt = 0;
    list.forEach(function (item) {
      var url = ((!!item['@id']) ? item['@id'] : item);

      if (!isValidURL(url)) {
        return reject(['Invalid depth parameter']);
      }

      const option = {
        method: 'GET',
        uri: url,
        resolveWithFullResponse: true
      };

      request(option)
        .then(function (response) {
          if (response.statusCode == 404) {
            return reject(['Invalid depth parameter']);
          }
          try {
            response.body = JSON.parse(response.body);
          } catch (exception) {
            return reject(['Invalid depth parameter']);
          }

          cnt += 1;
          arr.push(response.body);
          if (len == cnt) {
            resolve(arr);
          }
        });
    });
  });
};

function fetchDepthForObject(Obj) {
  return new Promise(function (resolve, reject) {
    if (!Obj) {
      return reject(['Invalid depth parameter']);
    }

    var url = ((!!Obj['@id']) ? Obj['@id'] : Obj);

    if (!isValidURL(url)) {
      return reject(['Invalid depth parameter']);
    }

    const option = {
      method: 'GET',
      uri: url,
      resolveWithFullResponse: true
    };

    request(option)
      .then(function (response) {
        if (response.code == 404) {
          return reject(['Invalid depth parameter']);
        }

        try {
          response.body = JSON.parse(response.body);
        } catch (exception) {
          return reject(['Invalid depth parameter']);
        }
        resolve(response.body);
      });
  });
};

exports.customCollectionFilter = function customCollectionFilter(collection, fields) {
  var len = collection.length;
  var cnt = 0;
  collection.map(function (item) {
    cnt += 1;
    fields.forEach(function (field) {
      item[field] = item[field].map(function (mItem) {
        return mItem['@id'];
      });
    });
    return item;
  });

  if (len == cnt) {
    return Promise.resolve(collection);
  }
};

exports.customObjectFilter = function (object, fields) {
  fields.forEach(function (field) {
    object[field] = object[field].map(function (mItem) {
      return mItem['@id'];
    });
  });
  return object;
};

function isValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater
  if (!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
};
