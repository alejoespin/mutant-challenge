/* eslint-disable require-jsdoc */
/* eslint-disable no-console */
const dbSrv = require("./db-services/db-services");

exports.handler = async event => {
  const result = await dbSrv.countDna({
    ExpressionAttributeValues: {
      ":type": true
    },
    FilterExpression: "isMutant = :type",
    TableName: "mutant-registry",
    SELECT: "COUNT"
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      count_mutant_dna: result.Count,
      count_human_dna: result.ScannedCount - result.Count,
      ratio: result.Count / (result.ScannedCount - result.Count)
    })
  };
  return response;
};
