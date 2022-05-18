const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const { request } = require('http');

let router = new express.Router();

// GET /invoices
// Return info on invoices: like {invoices: [{id, comp_code}, ...]}
router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM invoices');
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /invoices/[id]
// Returns obj on given invoice.
// If invoice cannot be found, returns 404.
// Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
		}
		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// POST /invoices
// Adds an invoice.
// Needs to be passed in JSON body of: {comp_code, amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT /invoices/[id]
// Updates an invoice.
// If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of {amt}
// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.patch('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt } = req.body;
		const results = await db.query(
			'UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
			[amt, id]
		);

		if (results.rows.length === 0) {
			throw new ExpressError(`Can't update user with id: ${id}`, 404);
		}
		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /invoices/[id]
// Deletes an invoice.
// If invoice cannot be found, returns a 404.
// Returns: {status: "deleted"}

router.delete('/:id', async (req, res, next) => {
	try {
		const results = await db.query(
			'DELETE FROM invoices WHERE id=$1 RETURNING id',
			[req.params.id]
		);

		if (results.rows.length === 0) {
			throw new ExpressError(
				`Can't delete user with id: ${req.params.id}`,
				404
			);
		}
		return res.json({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
