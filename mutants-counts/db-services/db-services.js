const AWS = require("aws-sdk");

const dynamoClient = () => {
  return new AWS.DynamoDB.DocumentClient();
};

const countDna = async (params, isMutant) => {
  return new Promise(function(resolve, reject) {
    dynamoClient().scan(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  countDna: countDna
};
