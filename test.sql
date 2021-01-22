\c biztime_test
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

