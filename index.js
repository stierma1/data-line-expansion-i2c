var translations = require("./dist/translations/index");

module.exports = function(dataSources){
  for(var i in translations){
    translations[i].initialize(dataSources);
  }
  dataSources.get("dataSourceTypes").set("i2c-input", require("./dist/data-sources/i2c-input"));
}
