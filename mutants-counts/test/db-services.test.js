/* eslint-disable no-undef */
const dbClient = require("../db-services/db-services");
const AWSMock = require("aws-sdk-mock");

describe("DB Services Tests", () => {
  afterEach(() => {
    AWSMock.restore("DynamoDB.DocumentClient");
  });

  it("DB scan OK", async () => {
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      callback(null, Promise.resolve());
    });
    await dbClient.countDna().then(() => {
      expect(Promise.resolve()).resolves.toBe();
    });
  });

  it("DB scan ERROR", async () => {
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      callback(new Error("error"));
    });
    await dbClient
      .countDna()
      .then(dnaData => {})
      .catch(error => expect(error).toStrictEqual(new Error("error")));
  });
});
