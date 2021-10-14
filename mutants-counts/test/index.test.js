const index = require("../index");
const dbSrv = require("../db-services/db-services");

describe("Test Index ", () => {
  const expectResponse = {
    statusCode: 200,
    body: JSON.stringify({
      count_mutant_dna: 40,
      count_human_dna: 100,
      ratio: 0.4
    })
  };

  jest.spyOn(dbSrv, "countDna").mockImplementation((event, callback) =>
    Promise.resolve({
      Items: [],
      Count: 40,
      ScannedCount: 140
    })
  );
  it("countTest", async () => {
    const result = await index.handler();
    console.log(`result ${result}`);
    expect(result).toStrictEqual(expectResponse);
  });
});
