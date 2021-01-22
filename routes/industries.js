const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(
			`SELECT code, industry, comp_code FROM industries FULL JOIN companies_industries ON industries.code = companies_industries.ind_code`
		);
		const industries = [];
		for (r of results.rows) {
			if (!industries.some((item) => item.industry == r.industry)) {
				industries.push({ industry: r.industry, code: r.code, companies: [ r.comp_code ] });
			} else {
				for (ind of industries) {
					if (r.code === ind.code) {
						ind.companies.push(r.comp_code);
					}
				}
			}
		}

		// for (r of results.rows) {
		// 	if (r.industry in industries) {
		// 		industries[r.industry].push(r.comp_code);
		// 	} else {
		// 		industries[r.industry] = [ r.comp_code ];
		// 	}
		// }
		// return res.json({ industries: industries });
		return res.json({ industries });
	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [
			code,
			industry
		]);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

router.post('/:code', async (req, res, next) => {
	try {
		const { comp_code } = req.body;
		const results = await db.query(
			`INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING *`,
			[ comp_code, req.params.code ]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
