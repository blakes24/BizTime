process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testComp;

beforeEach(async function() {
	let result = await db.query(`
        INSERT INTO companies
        VALUES ('ibm', 'IBM', 'Big blue.') RETURNING *`);
	testComp = result.rows[0];
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
});

afterAll(async function() {
	await db.end();
});

describe('GET /companies', function() {
	test('Gets a list of companies', async function() {
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			companies : [ { code: testComp.code, name: testComp.name } ]
		});
	});
});

describe('GET /companies/:code', function() {
	test('Gets a company', async function() {
		const response = await request(app).get(`/companies/ibm`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			company : {
				code        : testComp.code,
				name        : testComp.name,
				description : testComp.description,
				industries  : [ null ],
				invoices    : []
			}
		});
	});
	test('Returns 404 for invalid company', async function() {
		const response = await request(app).get(`/companies/fake`);
		expect(response.statusCode).toEqual(404);
	});
});

describe('POST /companies', function() {
	test('Adds a company to database', async function() {
		const response = await request(app).post(`/companies`).send({ name: 'Test Company', description: 'not real' });
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			company : { code: 'test-company', name: 'Test Company', description: 'not real' }
		});
	});
});

describe('PUT /companies/:code', function() {
	test('Updates a company', async function() {
		const response = await request(app)
			.put(`/companies/ibm`)
			.send({ name: 'Test Company', description: 'not real' });
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			company : { code: 'ibm', name: 'Test Company', description: 'not real' }
		});
	});
	test('Returns 404 for invalid company', async function() {
		const response = await request(app)
			.put(`/companies/fake`)
			.send({ name: 'Test Company', description: 'not real' });
		expect(response.statusCode).toEqual(404);
	});
});

describe('DELETE /companies/:code', function() {
	test('Deletes a company', async function() {
		const response = await request(app).delete(`/companies/ibm`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ status: 'deleted' });
	});
	test('Returns 404 for invalid company', async function() {
		const response = await request(app).delete(`/companies/fake`);
		expect(response.statusCode).toEqual(404);
	});
});
