/* eslint-disable require-jsdoc */
/* eslint-disable no-console */
const dbSrv = require("./db-services/db-services");

exports.handler = async event => {
  console.log(event.body);
  const rqDna = JSON.parse(event.body);
  let isMutantFlag = false;

  if (await isMutant(rqDna.dna)) {
    isMutantFlag = true;
  }

  await dbSrv.saveDna({
    TableName: "mutant-registry",
    Item: {
      dna: JSON.stringify(rqDna),
      isMutant: isMutantFlag
    }
  });

  const response = {
    statusCode: isMutantFlag ? 200 : 403,
    body: isMutantFlag ? "MUTANT" : ""
  };
  return response;
};

async function isMutant(dna) {
  const leng = 6;
  for (let i = 0; i < leng; i++) {
    for (let j = 0; j < leng; j++) {
      let flagHorz = 0;
      let flagVert = 0;
      let flagDiag = 0;
      let flagDiagI = 0;
      const data = dna[i].split("")[j];
      for (let count = 1; count < 4; count++) {
        if (
          !(i + count > 5 || j + count > 5) &&
          data == dna[i + count].split("")[j + count]
        ) {
          flagDiag++;
        }
        if (
          i + count <= 5 &&
          j - count >= 0 &&
          data == dna[i + count].split("")[j - count]
        ) {
          flagDiagI++;
        }
        if (j + count <= 5 && data == dna[i].split("")[j + count]) {
          flagHorz++;
        }
        if (i + count <= 5 && data == dna[i + count].split("")[j]) {
          flagVert++;
        }
      }
      if (flagHorz >= 3 || flagVert >= 3 || flagDiag >= 3 || flagDiagI >= 3) {
        return true;
      }
    }
  }
}
