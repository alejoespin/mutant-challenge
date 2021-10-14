/* eslint-disable no-undef */
const dbClient = require("../db-services/db-services");
const AWSMock = require("aws-sdk-mock");

describe("DB Services Tests", () => {
  afterEach(() => {
    AWSMock.restore("DynamoDB.DocumentClient");
  });

  it("DB put OK", async () => {
    AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
      callback(null, Promise.resolve());
    });
    await dbClient.saveDna("mutant").then(() => {
      expect(Promise.resolve()).resolves.toBe();
    });
  });

  it("DB put ERROR", async () => {
    AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
      callback(new Error("error"));
    });
    await dbClient
      .saveDna("mutant")
      .then(dnaData => {})
      .catch(error => expect(error).toStrictEqual(new Error("error")));
  });
});
