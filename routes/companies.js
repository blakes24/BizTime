const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT code, name FROM companies`);
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const comp_code = req.params.code;
		const compRes = await db.query(
			`SELECT
                c.code,
                c.name,
                c.description,
                i.industry
            FROM
                companies AS c
                LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code
                LEFT JOIN industries AS i ON ci.ind_code = i.code
            WHERE c.code = $1`,
			[ comp_code ]
		);
		const invRes = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [ comp_code ]);

		if (compRes.rows.length === 0) {
			throw new ExpressError(`Company with code ${comp_code} not found`, 404);
		}
		const { code, name, description } = compRes.rows[0];
		const industries = compRes.rows.map((i) => i.industry);
		const invoices = invRes.rows.map((i) => i.id);

		return res.json({ company: { code, name, description, industries, invoices } });
	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const code = slugify(name, { lower: true, strict: true });
		const results = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
			[ code, name, description ]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`, [
			name,
			description,
			req.params.code
		]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Company with code ${req.params.code} not found`, 404);
		}
		return res.json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING *`, [ req.params.code ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Company with code ${req.params.code} not found`, 404);
		}
		return res.json({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
