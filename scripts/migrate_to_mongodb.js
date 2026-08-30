/**
 * KSP SHERLOCK - MongoDB Data Ingestion & ETL Pipeline
 * 
 * Ingests all core datasets into MongoDB:
 *  1. `cases`           <- src/data/crimeGraphDataset.json + src/data/caseSummariesData.json (10,000 cases with GeoJSON)
 *  2. `accused`         <- src/data/accusedData.json (10,276 criminal profiles)
 *  3. `crime_networks`  <- public/data/network.json (50 syndicate clusters)
 * 
 * Usage:
 *   node scripts/migrate_to_mongodb.js "mongodb+srv://<user>:<password>@cluster.mongodb.net/ksp_sherlock"
 *   OR set environment variable: MONGODB_URI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { MongoClient } from 'mongodb';

// Ensure SRV records resolve cleanly on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Use default if custom servers unsupported
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI || 'mongodb://localhost:27017/ksp_sherlock';
const DB_NAME = process.env.DB_NAME || 'ksp_sherlock';

// Paths to JSON datasets
const crimeGraphPath = path.join(__dirname, '../src/data/crimeGraphDataset.json');
const accusedPath = path.join(__dirname, '../src/data/accusedData.json');
const caseSummariesPath = path.join(__dirname, '../src/data/caseSummariesData.json');
const networkPath = path.join(__dirname, '../public/data/network.json');

async function runMigration() {
  console.log('='.repeat(70));
  console.log('   KSP SHERLOCK - MONGODB DATA MIGRATION & ETL PIPELINE');
  console.log('='.repeat(70));
  console.log(`Connecting to MongoDB URI: ${MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB server.\n');

    const db = client.db(DB_NAME);

    // -------------------------------------------------------------
    // 1. INGEST ACCUSED DATA
    // -------------------------------------------------------------
    console.log('[1/3] Ingesting Accused / Offender Profiles...');
    if (fs.existsSync(accusedPath)) {
      const accusedRaw = JSON.parse(fs.readFileSync(accusedPath, 'utf-8'));
      const accusedCollection = db.collection('accused');

      console.log(`  Read ${accusedRaw.length} accused records from JSON.`);
      await accusedCollection.deleteMany({}); // Clean collection

      const BATCH_SIZE = 1000;
      for (let i = 0; i < accusedRaw.length; i += BATCH_SIZE) {
        const batch = accusedRaw.slice(i, i + BATCH_SIZE).map(item => ({
          _id: item.id,
          name: item.name,
          alias: item.alias,
          age: item.age,
          cases: item.cases,
          riskLevel: item.riskLevel,
          knownAssociates: item.knownAssociates || [],
          lastKnownLocation: item.lastKnownLocation || 'Bengaluru',
          status: item.status || 'At Large',
          crimeHistory: item.crimeHistory || [],
          updatedAt: new Date(),
        }));
        await accusedCollection.insertMany(batch, { ordered: false });
        process.stdout.write(`  Inserted ${Math.min(i + BATCH_SIZE, accusedRaw.length)}/${accusedRaw.length} records...\r`);
      }
      console.log(`\n  Creating indexes on 'accused' collection...`);
      await accusedCollection.createIndex({ name: 'text', alias: 'text' });
      await accusedCollection.createIndex({ riskLevel: 1, status: 1 });
      await accusedCollection.createIndex({ cases: -1 });
      console.log('  Accused collection ingestion complete.\n');
    }

    // -------------------------------------------------------------
    // 2. INGEST CASES & FIR RECORDS WITH GEOJSON
    // -------------------------------------------------------------
    console.log('[2/3] Ingesting Cases & Master Crime Graph Dataset...');
    if (fs.existsSync(crimeGraphPath)) {
      const crimeGraph = JSON.parse(fs.readFileSync(crimeGraphPath, 'utf-8'));
      const casesCollection = db.collection('cases');

      const caseSummariesMap = new Map();
      if (fs.existsSync(caseSummariesPath)) {
        const summaries = JSON.parse(fs.readFileSync(caseSummariesPath, 'utf-8'));
        summaries.forEach(s => {
          caseSummariesMap.set(s.caseNumber, s);
        });
      }

      const rawCases = crimeGraph.cases || [];
      console.log(`  Read ${rawCases.length} case records from JSON.`);
      await casesCollection.deleteMany({});

      const BATCH_SIZE = 1000;
      for (let i = 0; i < rawCases.length; i += BATCH_SIZE) {
        const batch = rawCases.slice(i, i + BATCH_SIZE).map(c => {
          const lat = parseFloat(c.latitude) || 12.9716;
          const lng = parseFloat(c.longitude) || 77.5946;
          const firNo = `FIR/${c.CrimeNo}/${c.Year}`;
          const summaryObj = caseSummariesMap.get(firNo) || {};

          return {
            caseMasterId: parseInt(c.CaseMasterID) || 0,
            crimeNo: c.CrimeNo,
            firNumber: firNo,
            title: summaryObj.title || `Crime Case #${c.CaseMasterID}`,
            summary: summaryObj.summary || '',
            registeredDate: new Date(c.CrimeRegisteredDate),
            year: parseInt(c.Year) || 2026,
            month: parseInt(c.Month) || 1,
            dayOfWeek: c.DayOfWeek,
            hour: parseInt(c.Hour) || 0,
            location: {
              type: 'Point',
              coordinates: [lng, lat], // GeoJSON standard: [longitude, latitude]
            },
            districtId: parseInt(c.DistrictID) || 1,
            districtName: crimeGraph.districts ? crimeGraph.districts[c.DistrictID] : 'Unknown',
            majorHeadId: parseInt(c.CrimeMajorHeadID) || 1,
            majorHeadName: crimeGraph.majors ? crimeGraph.majors[c.CrimeMajorHeadID] : 'Unknown',
            minorHeadId: parseInt(c.CrimeMinorHeadID) || 1,
            minorHeadName: crimeGraph.minors && crimeGraph.minors[c.CrimeMinorHeadID] ? crimeGraph.minors[c.CrimeMinorHeadID].name : 'Unknown',
            gravityLevel: parseInt(c.GravityOffenceID) || 1, // 1: Heinous ... 5: Petty
            caseStatusId: parseInt(c.CaseStatusID) || 1,
            caseStatus: crimeGraph.statuses ? crimeGraph.statuses[c.CaseStatusID] : 'Under Investigation',
            complainant: {
              age: parseInt(c.ComplainantAge) || 30,
              gender: c.ComplainantGender || 'U',
              occupationId: parseInt(c.OccupationID) || 1,
              socioEconomicIndex: parseInt(c.SocioEconomicIndex) || 1,
            },
            metrics: {
              victimCount: parseInt(c.VictimCount) || 1,
              accusedCount: parseInt(c.AccusedCount) || 1,
              arrestCount: parseInt(c.ArrestCount) || 0,
              hasRepeatOffender: c.HasRepeatOffender === '1' || c.HasRepeatOffender === 1,
              highRisk: c.HighRisk === '1' || c.HighRisk === 1,
            },
            assignedTo: summaryObj.assignedTo || 'Investigating Officer',
            priority: summaryObj.priority || (c.HighRisk === '1' ? 'High' : 'Normal'),
            createdAt: new Date(c.CrimeRegisteredDate),
            updatedAt: new Date(),
          };
        });

        await casesCollection.insertMany(batch, { ordered: false });
        process.stdout.write(`  Inserted ${Math.min(i + BATCH_SIZE, rawCases.length)}/${rawCases.length} records...\r`);
      }

      console.log(`\n  Creating indexes on 'cases' collection...`);
      await casesCollection.createIndex({ location: '2dsphere' }); // Spatial GeoJSON index
      await casesCollection.createIndex({ firNumber: 1 });
      await casesCollection.createIndex({ districtId: 1, majorHeadId: 1, gravityLevel: 1 });
      await casesCollection.createIndex({ registeredDate: -1 });
      await casesCollection.createIndex({ title: 'text', summary: 'text' });
      console.log('  Cases collection ingestion complete.\n');
    }

    // -------------------------------------------------------------
    // 3. INGEST CRIME NETWORKS & SYNDICATES
    // -------------------------------------------------------------
    console.log('[3/3] Ingesting Syndicate Crime Networks...');
    if (fs.existsSync(networkPath)) {
      const networkData = JSON.parse(fs.readFileSync(networkPath, 'utf-8'));
      const networkCollection = db.collection('crime_networks');

      await networkCollection.deleteMany({});
      
      const clusters = Array.isArray(networkData) ? networkData : (networkData.clusters || [networkData]);
      if (clusters.length > 0) {
        await networkCollection.insertMany(clusters);
        console.log(`  Inserted ${clusters.length} syndicate clusters.`);
      }
      console.log('  Crime networks collection ingestion complete.\n');
    }

    console.log('='.repeat(70));
    console.log('  ALL DATASETS SUCCESSFULLY INGESTED & INDEXED IN MONGODB!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('Migration failed with error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

runMigration();
