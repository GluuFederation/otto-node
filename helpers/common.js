exports.generateUUID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

exports.customCollectionFilter =  function customCollectionFilter(collection, fields) {
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