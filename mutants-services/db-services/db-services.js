const AWS = require("aws-sdk");

const dynamoClient = () => {
  return new AWS.DynamoDB.DocumentClient();
};

const saveDna = async params => {
  return new Promise(function(resolve, reject) {
    dynamoClient().put(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  saveDna: saveDna
};
