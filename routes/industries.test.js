process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testComp;
let testInd;

beforeEach(async function() {
	let compRes = await db.query(`
        INSERT INTO companies
        VALUES ('ibm', 'IBM', 'Big blue.') RETURNING *`);
	let indRes = await db.query(`
        INSERT INTO industries
        VALUES ('tech', 'Technology') RETURNING *`);
	testComp = compRes.rows[0];
	testInd = indRes.rows[0];
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
	await db.query('DELETE FROM industries');
});

afterAll(async function() {
	await db.end();
});

describe('GET /industries', function() {
	test('Gets all industries', async function() {
		const response = await request(app).get(`/industries`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			industries : [ { industry: testInd.industry, code: testInd.code, companies: [ null ] } ]
		});
	});
});

describe('POST /industries', function() {
	test('Add an industry', async function() {
		const response = await request(app).post(`/industries`).send({ code: 'fash', industry: 'Fashion' });
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			industry : { code: 'fash', industry: 'Fashion' }
		});
	});
});

describe('POST /industries/:code', function() {
	test('Add an industry', async function() {
		const response = await request(app).post(`/industries/${testInd.code}`).send({ comp_code: testComp.code });
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			industry : { comp_code: testComp.code, ind_code: testInd.code }
		});
	});
});
