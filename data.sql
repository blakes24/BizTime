\c biztime
DROP TABLE IF EXISTS invoices CASCADE;

DROP TABLE IF EXISTS companies CASCADE;

DROP TABLE IF EXISTS industries CASCADE;

DROP TABLE IF EXISTS companies_industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT FALSE NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL
);

CREATE TABLE companies_industries (
    comp_code text REFERENCES companies (code) ON DELETE CASCADE,
    ind_code text REFERENCES industries (code) ON DELETE CASCADE,
    PRIMARY KEY (comp_code, ind_code)
);

INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'), ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('apple', 100, FALSE, NULL), ('apple', 200, FALSE, NULL), ('apple', 300, TRUE, '2018-01-01'), ('ibm', 400, FALSE, NULL);

INSERT INTO industries
    VALUES ('tech', 'Technology');

INSERT INTO companies_industries (ind_code, comp_code)
    VALUES ('tech', 'apple'), ('tech', 'ibm');

SELECT
    c.code,
    c.name,
    c.description,
    i.industry
FROM
    companies AS c
    LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code
    LEFT JOIN industries AS i ON ci.ind_code = i.code
