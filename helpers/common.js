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
  var data = [];

  list.forEach(function (item, index) {
    var filterData = JSPath.apply(item, object);
    //data[item.substr(1, item.length)] = filterData;
    var newObj = {};
    item = item.substr(1, item.length);
    var path = item.substring(0, item.indexOf("{")) + item.substring(item.indexOf("}") + 1, item.length);
    assignKey(newObj, path.split("."), filterData);
    data = newObj;
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

exports.patchAdd = function (operation, obj) {
  if (!operation.value) {
    return Promise.reject({
      error: ['Value property required'],
      code: 404
    });
  }
  try {
    if (!!operation.path) {
      var basePath = getPath(operation.path).split(".");
      var cond = false;
      if (!!getValue(operation.path)) {
        cond = true;
      }
      var isConditionMatch = false;
      if (Array.isArray(obj[basePath[0]])) {
        // Check path[1] for only update to sub attribute
        obj[basePath[0]].forEach(function (item, index) {
          // condition for path parameter condition
          if (cond) {
            if (!!obj[basePath[0]][index][getAttr(operation.path)] && obj[basePath[0]][index][getAttr(operation.path)] == getValue(operation.path)) {
              if (!!basePath[1]) {
                obj[basePath[0]][index][basePath[1]] = operation.value;
              } else {
                obj[basePath[0]][index] = operation.value;
              }
              isConditionMatch = true;
            }
          } else {
            obj[basePath[0]][index][basePath[1]] = operation.value;
          }
        });

        if (cond && isConditionMatch == false && !basePath[1]) {
          operation.value = Array.isArray(operation.value) ? operation.value : [operation.value];
          operation.value.forEach(function (item) {
            if (obj[basePath[0]].indexOf(item) == -1) {
              obj[basePath[0]].push(item);
            }
          });

          return obj;
        }

        if (cond == false && !basePath[1]) {
          operation.value = Array.isArray(operation.value) ? operation.value : [operation.value];
          operation.value.forEach(function (item) {
            if (obj[basePath[0]].indexOf(item) == -1) {
              obj[basePath[0]].push(item);
            }
          });

          return obj;
        }

        // Update
        var arr = obj[basePath[0]];
        obj[basePath[0]] = [];
        arr.forEach(function (item) {
          obj[basePath[0]].push(item);
        });
      } else {
        // obj.name = "abc"
        setObject(obj, operation.path, operation.value);
        // obj[operation.path] = operation.value;
      }
    } else {
      // Without path to update direct as requested values
      Object.keys(operation.value).forEach(function (key) {
        if (Array.isArray(obj[key])) {
          var arr = Array.isArray(operation.value[key]) ? operation.value[key] : [operation.value[key]];
          arr.forEach(function (item) {
            if (obj[key].indexOf(item) == -1) {
              obj[key].push(item);
            }
          });
        } else {
          obj[key] = operation.value[key];
        }
      });
    }
    return obj;
  } catch (e) {
    return Promise.reject({
      error: ['Invalid patch request'],
      code: 404
    });
  }
};

exports.patchReplace = function (operation, obj) {
  if (!operation.value) {
    return Promise.reject({
      error: ['Value property required'],
      code: 404
    });
  }

  try {
    if (!!operation.path) {
      var basePath = getPath(operation.path).split(".");
      var cond = false;
      if (!!getValue(operation.path)) {
        cond = true;
      }
      var isConditionMatch = false;
      if (Array.isArray(obj[basePath[0]])) {
        // Check path[1] for only update to sub attribute
        if (!!basePath[1]) {
          obj[basePath[0]].forEach(function (item, index) {
            // condition for path parameter condition
            if (cond) {
              if (!!obj[basePath[0]][index][getAttr(operation.path)] && obj[basePath[0]][index][getAttr(operation.path)] == getValue(operation.path)) {
                if (!!basePath[1]) {
                  obj[basePath[0]][index][basePath[1]] = operation.value;
                } else {
                  obj[basePath[0]][index] = operation.value;
                }
                isConditionMatch = true;
              }
            } else {
              obj[basePath[0]][index][basePath[1]] = operation.value;
            }
          });

          if (cond && isConditionMatch == false && !basePath[1]) {
            obj[basePath[0]] = [];
            operation.value = Array.isArray(operation.value) ? operation.value : [operation.value];
            operation.value.forEach(function (item) {
              if (obj[basePath[0]].indexOf(item) == -1) {
                obj[basePath[0]].push(item);
              }
            });

            return obj;
          }

          if (cond == false && !basePath[1]) {
            operation.value = Array.isArray(operation.value) ? operation.value : [operation.value];
            operation.value.forEach(function (item) {
              if (obj[basePath[0]].indexOf(item) == -1) {
                obj[basePath[0]].push(item);
              }
            });

            return obj;
          }

          // Update
          var arr = obj[basePath[0]];
          obj[basePath[0]] = [];
          arr.forEach(function (item) {
            obj[basePath[0]].push(item);
          });
        } else {
          // Direct update to base path
          // Convert single value in multi value
          obj[basePath[0]] = [];
          operation.value = Array.isArray(operation.value) ? operation.value : [operation.value];
          operation.value.forEach(function (item) {
            if (obj[basePath[0]].indexOf(item) == -1) {
              obj[basePath[0]].push(item);
            }
          });
        }
      } else {
        setObject(obj, operation.path, operation.value);
        // obj[operation.path] = operation.value;
      }
    } else {
      Object.keys(operation.value).forEach(function (key) {
        if (Array.isArray(obj[key])) {
          var arr = Array.isArray(operation.value[key]) ? operation.value[key] : [operation.value[key]];
          obj[key] = [];
          arr.forEach(function (item) {
            if (obj[key].indexOf(item) == -1) {
              obj[key].push(item);
            }
          });
        } else {
          obj[key] = operation.value[key];
        }
      });
    }

    return obj;
  } catch (e) {
    return Promise.reject({
      error: ['Invalid patch request'],
      code: 404
    });
  }
};

exports.patchRemove = function (operation, obj) {
  if (!operation.path) {
    return Promise.reject({
      error: ['path property required'],
      code: 404
    });
  }

  try {
    if (operation.path.indexOf("/") == 0) {
      var refPath = operation.path.split("/");
      if (!!obj[refPath[1]] && !!refPath[2] && obj[refPath[1]].indexOf(refPath[2]) > -1) {
        obj[refPath[1]].splice(obj[refPath[1]].indexOf(refPath[2]), 1);
      }

      return obj;
    }

    if (!!operation.path) {
      var basePath = getPath(operation.path).split(".");
      var cond = false;
      if (!!getValue(operation.path)) {
        cond = true;
      }
      if (Array.isArray(obj[basePath[0]])) {
        // Check path[1] for only update to sub attribute
        obj[basePath[0]].forEach(function (item, index) {
          // condition for path parameter condition
          if (cond) {
            if (!!obj[basePath[0]][index][getAttr(operation.path)] && obj[basePath[0]][index][getAttr(operation.path)] == getValue(operation.path)) {
              if (!!basePath[1]) {
                obj[basePath[0]][index][basePath[1]] = "";
              } else {
                obj[basePath[0]].splice(index);
              }
            }
          } else {
            if (!!basePath[1]) {
              obj[basePath[0]][index][basePath[1]] = "";
            } else {
              obj[basePath[0]].splice(index);
            }
          }
        });

        // Update
        var arr = obj[basePath[0]];
        obj[basePath[0]] = [];
        arr.forEach(function (item) {
          obj[basePath[0]].push(item);
        });
      } else {
        setObject(obj, operation.path, "");
        // obj[operation.path] = operation.value;
      }
    } else {
      obj[key] = [];
    }

    return obj;
  } catch (e) {
    return Promise.reject({
      error: ['Invalid patch request'],
      code: 404
    });
  }
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
        })
        .catch(function (error) {
          return reject(['Invalid depth parameter']);
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
      })
      .catch(function (error) {
        return reject(['Invalid depth parameter']);
      });
  });
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

function setObject(obj, path, value) {
  var schema = obj;  // a moving reference to internal objects within obj
  var pList = path.split('.');
  var len = pList.length;
  for (var i = 0; i < len - 1; i++) {
    var elem = pList[i];
    if (!schema[elem]) schema[elem] = {}
    schema = schema[elem];
  }

  schema[pList[len - 1]] = value;
}

function assignKey(obj, keyPath, value) {
  var lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj))
      obj[key] = {}
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

function getAttr(str) {
  return str.substring(str.indexOf("[") + 1, str.indexOf(" "));
}

function getPath(str) {
  return str.substring(0, str.indexOf("[")) + str.substring(str.indexOf("]") + 1, str.length);
}

function getValue(str) {
  return str.substring(str.indexOf("\"") + str.indexOf("'") + 2, str.lastIndexOf("\"") + str.lastIndexOf("'") + 1);
}