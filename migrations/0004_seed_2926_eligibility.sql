insert into str_eligibility_criteria (
    program_code,
    program_name,
    scheme_year,
    criteria_json,
    version,
    is_active
)
values (
    'STR',
    'Sumbangan Tunai Rahmah',
    2026,
    '{
      "schemaVersion": 1,
      "programCode": "STR",
      "schemeYear": 2026,
      "source": "BantuanKu STR 2026 program specification",
      "scope": "preliminary_guidance_only",
      "assessmentNotes": "Preliminary assessment only. Final eligibility and approval are subject to LHDNM verification.",
      "rules": [
        {
          "ruleCode": "str-001",
          "name": "household eligibility",
          "recipientCategory": "household",
          "conditions": {
            "all": [
              {
                "field": "applicant.citizenship",
                "operator": "eq",
                "value": "Malaysian"
              },
              {
                "field": "applicant.residenceCountry",
                "operator": "eq",
                "value": "Malaysia"
              },
              {
                "field": "household.monthlyIncome",
                "operator": "lte",
                "value": 5000
              },
              {
                "any": [
                  {
                    "field": "applicant.maritalStatus",
                    "operator": "eq",
                    "value": "married"
                  },
                  {
                    "all": [
                      {
                        "field": "applicant.maritalStatus",
                        "operator": "in",
                        "value": [
                          "single",
                          "divorced",
                          "widowed"
                        ]
                      },
                      {
                        "field": "household.numberOfEligibleChildren",
                        "operator": "gte",
                        "value": 1
                      }
                    ]
                  }
                ]
              }
            ]
          },
          "result": "preliminary_match",
          "assessmentNotes": "Applicant must satisfy the household category requirements. Marriage, parental relationship, eligible children, household income and residence remain subject to LHDNM verification."
        },
        {
          "ruleCode": "str-002",
          "name": "elderly without spouse eligibility",
          "recipientCategory": "elderly_without_spouse",
          "conditions": {
            "all": [
              {
                "field": "applicant.citizenship",
                "operator": "eq",
                "value": "Malaysian"
              },
              {
                "field": "applicant.residenceCountry",
                "operator": "eq",
                "value": "Malaysia"
              },
              {
                "field": "applicant.age",
                "operator": "gte",
                "value": 60
              },
              {
                "field": "applicant.monthlyPersonalIncome",
                "operator": "lte",
                "value": 5000
              },
              {
                "field": "applicant.maritalStatus",
                "operator": "in",
                "value": [
                  "single",
                  "divorced",
                  "widowed"
                ]
              },
              {
                "field": "household.numberOfEligibleChildren",
                "operator": "eq",
                "value": 0
              }
            ]
          },
          "result": "preliminary_match",
          "assessmentNotes": "Applicant must be at least 60 years old, have no spouse or eligible children, and satisfy the income requirement. Final verification is performed by LHDNM."
        },
        {
          "ruleCode": "str-003",
          "name": "single eligibility",
          "recipientCategory": "single",
          "conditions": {
            "all": [
              {
                "field": "applicant.citizenship",
                "operator": "eq",
                "value": "Malaysian"
              },
              {
                "field": "applicant.residenceCountry",
                "operator": "eq",
                "value": "Malaysia"
              },
              {
                "field": "applicant.monthlyPersonalIncome",
                "operator": "lte",
                "value": 2500
              },
              {
                "field": "applicant.maritalStatus",
                "operator": "in",
                "value": [
                  "single",
                  "divorced",
                  "widowed"
                ]
              },
              {
                "field": "household.numberOfEligibleChildren",
                "operator": "eq",
                "value": 0
              },
              {
                "field": "applicant.isFullTimeIptaIptsStudent",
                "operator": "eq",
                "value": false
              },
              {
                "any": [
                  {
                    "all": [
                      {
                        "field": "applicant.age",
                        "operator": "gte",
                        "value": 21
                      },
                      {
                        "field": "applicant.age",
                        "operator": "lte",
                        "value": 59
                      }
                    ]
                  },
                  {
                    "all": [
                      {
                        "field": "applicant.age",
                        "operator": "gte",
                        "value": 19
                      },
                      {
                        "field": "applicant.age",
                        "operator": "lte",
                        "value": 59
                      },
                      {
                        "field": "applicant.okuRegistered",
                        "operator": "eq",
                        "value": true
                      }
                    ]
                  }
                ]
              }
            ]
          },
          "result": "preliminary_match",
          "assessmentNotes": "Applicant must satisfy the single category age and income requirements, have no spouse or eligible children, and must not be a full-time IPTA/IPTS student. Registered OKU applicants may qualify from age 19. Assistance for this category is provided through SARA under the STR 2026 specification."
        },
        {
          "ruleCode": "str-004",
          "name": "no preliminary match",
          "conditions": {
            "not": {
              "any": [
                {
                  "ruleMatched": "str-001"
                },
                {
                  "ruleMatched": "str-002"
                },
                {
                  "ruleMatched": "str-003"
                }
              ]
            }
          },
          "result": "no_preliminary_match",
          "assessmentNotes": "Applicant does not satisfy any STR 2026 recipient category based on the available information. Missing or unknown information must not be interpreted as a failed eligibility condition."
        }
      ]
    }',
    1,
    1
)
on conflict (program_code, scheme_year, version)
do nothing;
