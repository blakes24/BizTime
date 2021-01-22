process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testComp;
let testInv;

beforeEach(async function() {
	let compRes = await db.query(`
        INSERT INTO companies
        VALUES ('ibm', 'IBM', 'Big blue.') RETURNING *`);
	let invRes = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ('ibm', 400, false, null) RETURNING *`);
	testComp = compRes.rows[0];
	testInv = invRes.rows[0];
});

afterEach(async function() {
	await db.query('DELETE FROM companies');
	await db.query('DELETE FROM invoices');
});

afterAll(async function() {
	await db.end();
});

describe('GET /invoices', function() {
	test('Gets a list of invoices', async function() {
		const response = await request(app).get(`/invoices`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			invoices : [ { id: testInv.id, comp_code: testInv.comp_code } ]
		});
	});
});

describe('GET /invoices/:id', function() {
	test('Gets an invoice', async function() {
		const response = await request(app).get(`/invoices/${testInv.id}`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			invoice : {
				id        : testInv.id,
				amt       : testInv.amt,
				paid      : testInv.paid,
				add_date  : expect.any(String),
				paid_date : null,
				company   : { code: testComp.code, name: testComp.name, description: testComp.description }
			}
		});
	});
	test('Returns 404 for invalid invoice', async function() {
		const response = await request(app).get(`/invoices/4359`);
		expect(response.statusCode).toEqual(404);
	});
});

describe('POST /invoices', function() {
	test('Adds an invoice to database', async function() {
		const response = await request(app).post(`/invoices`).send({ comp_code: 'ibm', amt: 600 });
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			invoice : {
				id        : expect.any(Number),
				comp_code : 'ibm',
				amt       : 600,
				paid      : false,
				add_date  : expect.any(String),
				paid_date : null
			}
		});
	});
});

describe('PUT /invoices/:code', function() {
	test('Updates an invoice', async function() {
		const response = await request(app).put(`/invoices/${testInv.id}`).send({ paid: true, amt: 600 });
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			invoice : {
				id        : expect.any(Number),
				comp_code : 'ibm',
				amt       : 600,
				paid      : true,
				add_date  : expect.any(String),
				paid_date : expect.any(String)
			}
		});
	});
	test('Returns 404 for invalid invoice', async function() {
		const response = await request(app).put(`/invoices/3456`).send({ paid: true, amt: 600 });
		expect(response.statusCode).toEqual(404);
	});
});

describe('DELETE /invoices/:code', function() {
	test('Deletes an invoice', async function() {
		const response = await request(app).delete(`/invoices/${testInv.id}`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ status: 'deleted' });
	});
	test('Returns 404 for invalid invoice', async function() {
		const response = await request(app).delete(`/invoices/5678`);
		expect(response.statusCode).toEqual(404);
	});
});
