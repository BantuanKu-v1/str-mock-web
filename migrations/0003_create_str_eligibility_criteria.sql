create table if not exists str_eligibility_criteria (
    id integer primary key autoincrement,
    program_code text not null default 'STR' check(program_code = 'STR'),
    program_name text not null default 'Sumbangan Tunai Rahmah',
    scheme_year integer not null check(scheme_year >= 2020),
    criteria_json text not null check(json_valid(criteria_json)),
    version integer not null default 1 check(version >= 1),
    is_active integer not null default 1 check(is_active in (0, 1)),
    updated_at text not null default current_timestamp,

    unique(program_code, scheme_year, version)
);

-- Only one active criteria version per scheme year
create unique index if not exists idx_str_eligibility_active_year
on str_eligibility_criteria (scheme_year, program_code)
where is_active = 1;

create index if not exists idx_str_eligibility_scheme_year
on str_eligibility_criteria (scheme_year);
