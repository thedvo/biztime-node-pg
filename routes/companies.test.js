// npm packages
const request = require('supertest');

// app imports
const app = require('../app');
const db = require('../db');

const { createData } = require('../test_common');

beforeEach(createData);

afterAll(async function () {
	// close db connection
	await db.end();
});

describe('GET /', function () {
	test('It should respond with array of companies', async function () {
		const response = await request(app).get('/companies');
		expect(response.body).toEqual({
			companies: [
				{ code: 'apple', name: 'Apple' },
				{ code: 'ibm', name: 'IBM' },
			],
		});
	});
});

describe('GET /apple', function () {
	test('It return company info', async function () {
		const response = await request(app).get('/companies/apple');
		expect(response.body).toEqual({
			company: {
				code: 'apple',
				name: 'Apple',
				description: 'Maker of OSX.',
				invoices: [1, 2],
			},
		});
	});

	test('It should return 404 for no-such-company', async function () {
		const response = await request(app).get('/companies/blargh');
		expect(response.status).toEqual(404);
	});
});

describe('POST /', function () {
	test('It should add company', async function () {
		const response = await request(app)
			.post('/companies')
			.send({ name: 'Nvidia', description: 'cool!' });

		expect(response.body).toEqual({
			company: {
				code: 'nvidia',
				name: 'Nvidia',
				description: 'cool!',
			},
		});
	});

	test('It should return 500 for conflict', async function () {
		const response = await request(app)
			.post('/companies')
			.send({ name: 'Apple', description: 'Oops. Another one!' });

		expect(response.status).toEqual(500);
	});
});

describe('PUT /', function () {
	test('It should update company', async function () {
		const response = await request(app)
			.put('/companies/apple')
			.send({ name: 'AppleEdit', description: 'NewDescrip' });

		expect(response.body).toEqual({
			company: {
				code: 'apple',
				name: 'AppleSauce',
				description: 'NewDescrip',
			},
		});
	});
});

describe('DELETE /', function () {
	test('It should delete company', async function () {
		const response = await request(app).delete('/companies/apple');

		expect(response.body).toEqual({ status: 'deleted' });
	});
});
