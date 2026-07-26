import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../Copy_of_Accused.csv');
const jsonPath = path.join(__dirname, '../src/data/accusedData.json');

const csvData = fs.readFileSync(csvPath, 'utf-8');
const lines = csvData.split('\n').map(line => line.trim()).filter(line => line);

const headers = lines[0].split(',');
// AccusedMasterID,CaseMasterID,AccusedName,AgeYear,GenderID,PersonID,RepeatOffenderKey

const casesMap = {}; // CaseMasterID -> set of AccusedNames
const offendersMap = {}; // groupId -> offender object

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length < 7) continue;

  const caseId = cols[1];
  const name = cols[2];
  const age = parseInt(cols[3]) || 0;
  const gender = cols[4];
  const repeatKey = cols[6] && cols[6].trim() !== '' ? cols[6].trim() : null;

  const groupId = repeatKey || `${name}_${age}_${gender}`;

  if (!casesMap[caseId]) {
    casesMap[caseId] = new Set();
  }
  casesMap[caseId].add(name);

  if (!offendersMap[groupId]) {
    offendersMap[groupId] = {
      id: groupId,
      name: name,
      alias: repeatKey ? `Alias-${repeatKey}` : 'N/A',
      age: age,
      casesSet: new Set(),
      gender: gender,
      knownAssociates: new Set(),
      status: 'At Large', // Will randomize later
    };
  }
  
  offendersMap[groupId].casesSet.add(caseId);
}

// Populate associates and finalize risk level
const statuses = ['At Large', 'In Custody', 'On Bail', 'Wanted'];

const finalOffenders = Object.values(offendersMap).map((offender, index) => {
  // Find associates
  const associates = new Set();
  offender.casesSet.forEach(caseId => {
    const peopleInCase = casesMap[caseId];
    if (peopleInCase) {
      peopleInCase.forEach(personName => {
        if (personName !== offender.name) {
          associates.add(personName);
        }
      });
    }
  });

  const caseCount = offender.casesSet.size;
  let risk = 'Low';
  if (caseCount >= 3) risk = 'Critical';
  else if (caseCount === 2) risk = 'High';
  else if (caseCount === 1) risk = 'Medium'; // Let's make 1 Medium to show some colors

  return {
    id: offender.id + '_' + index,
    name: offender.name,
    alias: offender.alias,
    age: offender.age,
    cases: caseCount,
    riskLevel: risk,
    knownAssociates: Array.from(associates),
    lastKnownLocation: 'Bengaluru',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    crimeHistory: Array.from(offender.casesSet).map(c => `Case #${c}`)
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(finalOffenders, null, 2));
console.log(`Successfully processed ${lines.length - 1} records into ${finalOffenders.length} unique offenders.`);
