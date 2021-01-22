const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT id, comp_code FROM invoices`);
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const results = await db.query(
			`SELECT * FROM invoices FULL JOIN companies ON invoices.comp_code = companies.code WHERE id=$1`,
			[ req.params.id ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
		}
		const data = results.rows[0];
		const invoice = {
			invoice : {
				id        : data.id,
				amt       : data.amt,
				paid      : data.paid,
				add_date  : data.add_date,
				paid_date : data.paid_date,
				company   : { code: data.code, name: data.name, description: data.description }
			}
		};
		return res.json(invoice);
	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [
			comp_code,
			amt
		]);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const { amt, paid } = req.body;

		const results = await db.query(`SELECT paid, paid_date FROM invoices WHERE id=$1`, [ req.params.id ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
		}
		let paid_date = results.rows[0].paid_date;
		let checkPaid = results.rows[0].paid;

		if (paid === true && checkPaid === false) {
			paid_date = new Date();
		}
		if (paid === false) {
			paid_date = null;
		}

		const putRes = await db.query(
			`UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING *`,
			[ amt, paid, paid_date, req.params.id ]
		);

		return res.json({ invoice: putRes.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const results = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING *`, [ req.params.id ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`No such invoice: ${req.params.id}`, 404);
		}
		return res.json({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
