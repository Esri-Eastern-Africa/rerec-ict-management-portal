#!/usr/bin/env node
/**
 * setup-feature-layers.mjs
 *
 * Creates all 11 ICT Management feature layers (hosted tables) in an ArcGIS Enterprise portal.
 *
 * Usage:
 *   node scripts/setup-feature-layers.mjs \
 *     --portal https://gisportal.example.com/portal \
 *     --username admin \
 *     --password yourpassword \
 *     --folder "ICT Management"   (optional)
 */

import { parseArgs } from 'node:util';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// ─── Parse CLI args ──────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    portal: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
    folder: { type: 'string', default: '' },
  },
  allowPositionals: false,
});

// ─── Prompt helper ───────────────────────────────────────────────────────────

async function prompt(question, defaultVal = '') {
  const rl = readline.createInterface({ input, output });
  const suffix = defaultVal ? ` [${defaultVal}]` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  rl.close();
  return answer.trim() || defaultVal;
}

// ─── Feature layer definitions ────────────────────────────────────────────────

const LAYERS = [
  {
    name: 'FacilityCategories',
    description: 'Lookup table for facility categories',
    fields: [
      { name: 'facility_category', alias: 'Facility Category', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'FacilityTypes',
    description: 'Lookup table for facility types',
    fields: [
      { name: 'facility_type', alias: 'Facility Type', type: 'esriFieldTypeString', length: 255, nullable: false },
      { name: 'facility_category', alias: 'Facility Category', type: 'esriFieldTypeGUID', length: 38, nullable: true },
    ],
  },
  {
    name: 'FundingAgencies',
    description: 'Lookup table for funding agencies',
    fields: [
      { name: 'funding_agency', alias: 'Funding Agency', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'FundingCategories',
    description: 'Lookup table for funding categories',
    fields: [
      { name: 'funding_category', alias: 'Funding Category', type: 'esriFieldTypeString', length: 255, nullable: false },
      { name: 'funding_type', alias: 'Funding Type', type: 'esriFieldTypeString', length: 255, nullable: true },
    ],
  },
  {
    name: 'ProjectCycleStatuses',
    description: 'Lookup table for project cycle statuses',
    fields: [
      { name: 'project_cycle_status', alias: 'Project Cycle Status', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'ProjectImplementationStatuses',
    description: 'Lookup table for project implementation statuses',
    fields: [
      { name: 'project_implementation_status', alias: 'Project Implementation Status', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'ProjectInitiatorCategories',
    description: 'Lookup table for project initiator categories',
    fields: [
      { name: 'project_initiator_category', alias: 'Project Initiator Category', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'ProjectTypes',
    description: 'Lookup table for project types',
    fields: [
      { name: 'project_type', alias: 'Project Type', type: 'esriFieldTypeString', length: 255, nullable: false },
    ],
  },
  {
    name: 'Substations',
    description: 'Lookup table for substations',
    fields: [
      { name: 'substation_id', alias: 'Substation ID', type: 'esriFieldTypeInteger', nullable: true },
      { name: 'substation_name', alias: 'Substation Name', type: 'esriFieldTypeString', length: 255, nullable: false },
      { name: 'substation_number', alias: 'Substation Number', type: 'esriFieldTypeString', length: 100, nullable: true },
      { name: 'substation_type', alias: 'Substation Type', type: 'esriFieldTypeString', length: 100, nullable: true },
      { name: 'voltage_transformation_id', alias: 'Voltage Transformation ID', type: 'esriFieldTypeGUID', length: 38, nullable: true },
    ],
  },
  {
    name: 'Vendors',
    description: 'Lookup table for vendors',
    fields: [
      { name: 'vendor_name', alias: 'Vendor Name', type: 'esriFieldTypeString', length: 255, nullable: false },
      { name: 'vendor_email', alias: 'Vendor Email', type: 'esriFieldTypeString', length: 255, nullable: true },
      { name: 'vendor_phone_number', alias: 'Vendor Phone Number', type: 'esriFieldTypeString', length: 50, nullable: true },
    ],
  },
  {
    name: 'VoltageTransformations',
    description: 'Lookup table for voltage transformations',
    fields: [
      { name: 'voltage_transformation', alias: 'Voltage Transformation', type: 'esriFieldTypeString', length: 100, nullable: false },
    ],
  },
];

// Standard audit fields added to every layer
const AUDIT_FIELDS = [
  { name: 'created_user', alias: 'Created User', type: 'esriFieldTypeString', length: 255, nullable: true },
  { name: 'created_date', alias: 'Created Date', type: 'esriFieldTypeDate', nullable: true },
  { name: 'last_edited_user', alias: 'Last Edited User', type: 'esriFieldTypeString', length: 255, nullable: true },
  { name: 'last_edited_date', alias: 'Last Edited Date', type: 'esriFieldTypeDate', nullable: true },
];

// ─── ArcGIS helpers ───────────────────────────────────────────────────────────

async function generateToken(portalUrl, username, password) {
  const body = new URLSearchParams({
    username, password,
    referer: 'http://localhost',
    expiration: '60',
    f: 'json',
  });
  const res = await fetch(`${portalUrl}/sharing/rest/generateToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Token error: ${data.error.message}`);
  return data.token;
}

async function getUserContentUrl(portalUrl, token, username, folder) {
  const base = `${portalUrl}/sharing/rest/content/users/${username}`;
  if (!folder) return base;

  // Check if folder exists; create if not
  const foldersRes = await fetch(`${base}?f=json&token=${token}`);
  const foldersData = await foldersRes.json();
  const existing = (foldersData.folders || []).find((f) => f.title === folder);
  if (existing) return `${base}/${existing.id}`;

  // Create folder
  const createRes = await fetch(`${base}/createFolder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ title: folder, f: 'json', token }).toString(),
  });
  const createData = await createRes.json();
  if (createData.error) throw new Error(`Failed to create folder: ${createData.error.message}`);
  return `${base}/${createData.folder.id}`;
}

async function createHostedTable(portalUrl, token, contentUrl, layerDef) {
  const allFields = [...layerDef.fields, ...AUDIT_FIELDS];

  const serviceDefinition = {
    name: layerDef.name,
    description: layerDef.description,
    serviceDescription: layerDef.description,
    hasStaticData: false,
    maxRecordCount: 2000,
    supportedQueryFormats: 'JSON',
    capabilities: 'Create,Delete,Query,Update,Editing',
    xssPreventionInfo: { xssPreventionEnabled: true, xssPreventionRule: 'InputOnly', xssInputRule: 'rejectInvalidCharacters' },
    tables: [
      {
        id: 0,
        name: layerDef.name,
        type: 'Table',
        fields: allFields,
        globalIdField: 'globalid',
        objectIdField: 'objectid',
        hasGlobalId: true,
        capabilities: 'Create,Delete,Query,Update,Editing',
        supportsRollbackOnFailureParameter: true,
      },
    ],
    layers: [],
  };

  // Step 1: Create the item
  const createBody = new URLSearchParams({
    title: layerDef.name,
    type: 'Feature Service',
    tags: 'ict-management,rerec',
    description: layerDef.description,
    text: JSON.stringify({ serviceDefinition }),
    f: 'json',
    token,
  });

  const createRes = await fetch(`${contentUrl}/addItem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: createBody.toString(),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    throw new Error(`Failed to create item for ${layerDef.name}: ${JSON.stringify(createData.error)}`);
  }

  // Step 2: Publish to create the hosted feature service
  const publishBody = new URLSearchParams({
    itemId: createData.id,
    filetype: 'serviceDefinition',
    publishParameters: JSON.stringify({ name: layerDef.name, hasStaticData: false }),
    f: 'json',
    token,
  });

  const publishRes = await fetch(`${contentUrl}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: publishBody.toString(),
  });
  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Failed to publish ${layerDef.name}: ${publishData.error.message}`);
  }

  const serviceUrl = publishData.services?.[0]?.serviceurl;
  return { itemId: createData.id, serviceUrl };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== REREC ICT Management — Feature Layer Setup ===\n');

  const portalUrl = args.portal || await prompt('Portal URL');
  const username = args.username || await prompt('Username');
  const password = args.password || await prompt('Password');
  const folder = args.folder || await prompt('Portal folder name (leave blank for root)', '');

  if (!portalUrl || !username || !password) {
    console.error('Portal URL, username, and password are all required.');
    process.exit(1);
  }

  const portal = portalUrl.replace(/\/$/, '');

  console.log(`\nConnecting to ${portal}...`);
  const token = await generateToken(portal, username, password);
  console.log('Token acquired.\n');

  const contentUrl = await getUserContentUrl(portal, token, username, folder);
  console.log(`Publishing to: ${contentUrl}\n`);

  const results = [];

  for (const layer of LAYERS) {
    process.stdout.write(`Creating ${layer.name}... `);
    try {
      const { serviceUrl } = await createHostedTable(portal, token, contentUrl, layer);
      const layerUrl = serviceUrl ? `${serviceUrl}/0` : '(see portal for URL)';
      console.log(`OK — ${layerUrl}`);
      results.push({ name: layer.name, url: layerUrl });
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      results.push({ name: layer.name, url: null, error: err.message });
    }
  }

  console.log('\n=== Summary ===\n');
  console.log('Add these to your .env.local file:\n');

  const envMap = {
    FacilityCategories: 'FACILITY_CATEGORIES_URL',
    FacilityTypes: 'FACILITY_TYPES_URL',
    FundingAgencies: 'FUNDING_AGENCIES_URL',
    FundingCategories: 'FUNDING_CATEGORIES_URL',
    ProjectCycleStatuses: 'PROJECT_CYCLE_STATUSES_URL',
    ProjectImplementationStatuses: 'PROJECT_IMPLEMENTATION_STATUSES_URL',
    ProjectInitiatorCategories: 'PROJECT_INITIATOR_CATEGORIES_URL',
    ProjectTypes: 'PROJECT_TYPES_URL',
    Substations: 'SUBSTATIONS_URL',
    Vendors: 'VENDORS_URL',
    VoltageTransformations: 'VOLTAGE_TRANSFORMATIONS_URL',
  };

  for (const r of results) {
    const envKey = envMap[r.name] || r.name.toUpperCase() + '_URL';
    if (r.url) {
      console.log(`${envKey}=${r.url}`);
    } else {
      console.log(`# ${envKey}=FAILED — ${r.error}`);
    }
  }

  console.log('\nSetup complete.\n');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
