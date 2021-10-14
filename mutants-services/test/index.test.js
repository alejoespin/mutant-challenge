const index = require("../index");
const dbSrv = require("../db-services/db-services");

describe("Test Index ", () => {
  const vertMutantTest = {
    body: '{"dna":["ATGGCG", "AAGTGC", "TTGTGT", "TGAAGG", "TCCCTA", "TCACTG"]}'
  };
  const horzMutantTest = {
    body: '{"dna":["ATGCCG", "CAGTGC", "TTGTGT", "AGAAGG", "CCCCTA", "TCACTG"]}'
  };
  const diagMutantTest = {
    body: '{"dna":["ATGCCA", "CCGCGC", "ACTTGT", "AGATAT", "CCACTA", "TCACTT"]}'
  };
  const diagMutantTest2 = {
    body: '{"dna":["ATGCCA", "CCGCGC", "ACTAGT", "AGAGAT", "CAACTA", "ACACTT"]}'
  };
  const noMutantTest = {
    body: '{"dna":["ATGCCA", "CCGGGC", "ATTTGT", "AGATTT", "CCACTA", "TCACTC"]}'
  };

  const mutantResponse = {
    statusCode: 200,
    body: "MUTANT"
  };
  const noMutantResponse = {
    statusCode: 403,
    body: ""
  };
  jest
    .spyOn(dbSrv, "saveDna")
    .mockImplementation((event, callback) => Promise.resolve(true));

  it("vertMutantTest", async () => {
    const result = await index.handler(vertMutantTest);
    console.log(`result ${JSON.stringify(result)}`);
    expect(result).toStrictEqual(mutantResponse);
  });
  it("horzMutantTest", async () => {
    const result = await index.handler(horzMutantTest);
    console.log(`result ${JSON.stringify(result)}`);
    expect(result).toStrictEqual(mutantResponse);
  });
  it("diagMutantTest", async () => {
    const result = await index.handler(diagMutantTest);
    console.log(`result ${JSON.stringify(result)}`);
    expect(result).toStrictEqual(mutantResponse);
  });
  it("diagMutantTest2", async () => {
    const result = await index.handler(diagMutantTest2);
    console.log(`result ${JSON.stringify(result)}`);
    expect(result).toStrictEqual(mutantResponse);
  });
  it("noMutantTest", async () => {
    const result = await index.handler(noMutantTest);
    console.log(`result ${JSON.stringify(result)}`);
    expect(result).toStrictEqual(noMutantResponse);
  });
});
