create table if not exists str_applications (
    id text primary key,
    client_id text not null,
    external_application_id text not null,
    reference_no text not null unique,
    applicant_name text not null,
    application_year integer not null,
    status text not null default 'submitted'
        check (
            status in (
                'submitted',
                'under_review',
                'approved',
                'rejected'
                    )
        ),
    submitted_at text not null default current_timestamp,
    updated_at text not null default current_timestamp,
    unique (client_id, external_application_id)
);

create index if not exists idx_str_applications_status
on str_applications (status);

create index if not exists idx_str_applications_submitted_at
on str_applications (submitted_at);
