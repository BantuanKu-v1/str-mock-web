import { z } from "zod";

const nullableText = (maxLength: number) =>
    z.string().trim().max(maxLength).nullable();

const nullableBoolean = z.boolean().nullable();
const nullableMoney = z.number().nonnegative().nullable();
const dateSchema = z.iso.date();

const applicantSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(150),
  identificationNo: z.string().trim().min(1).max(12),
  dateOfBirth: dateSchema,
  gender: nullableText(30),
  citizenship: z.string().trim().min(1).max(50),
  maritalStatus: nullableText(50),
});

const contactSchema = z.strictObject({
  mobilePhone: nullableText(30),
  homePhone: nullableText(30),
  email: z.email().nullable(),
});

const addressSchema = z.strictObject({
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: nullableText(255),
  postcode: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(100),
  stateTerritory: z.string().trim().min(1).max(100),
  countryCode: z.string().trim().min(2).max(20),
});

const financialSchema = z.strictObject({
  monthlyPersonalIncome: nullableMoney,
  monthlyHouseholdIncome: nullableMoney,
  incomeSource: nullableText(100),
});

const employmentSchema = z.strictObject({
  occupation: nullableText(150),
  employmentStatus: nullableText(50),
  isStudent: nullableBoolean,
  studyMode: nullableText(50),
  institutionType: nullableText(100),
});

const householdMemberSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(150),
  identificationNo: nullableText(12),
  relationship: z.string().trim().min(1).max(50),
  dateOfBirth: dateSchema.nullable(),
  gender: nullableText(30),
  citizenship: nullableText(50),
  isDependent: nullableBoolean,
  employmentStatus: nullableText(50),
  occupation: nullableText(150),
  monthlyIncome: nullableMoney,
  isStudent: nullableBoolean,
  studyMode: nullableText(50),
  institutionType: nullableText(100),
  isOku: nullableBoolean,
  okuRegistered: nullableBoolean,
});

const householdSchema = z.strictObject({
  members: z.array(householdMemberSchema).max(100),
  informationComplete: z.literal(true),
});

const preliminaryEligibilitySchema = z.strictObject({
  status: z.enum([
    "potentially_eligible",
    "potentially_ineligible",
    "insufficient_information",
    "manual_verification",
  ]),
  criteriaVersion: z.number().int().positive(),
  assessedAt: z.iso.datetime(),
});

export const strApplicationDataSchema = z.strictObject({
  schemaVersion: z.literal(1),
  applicant: applicantSchema,
  contact: contactSchema,
  address: addressSchema,
  financial: financialSchema,
  employment: employmentSchema,
  household: householdSchema,
  preliminaryEligibility: preliminaryEligibilitySchema.optional(),
});

export const createApplicationSchema = z
    .strictObject({
      externalApplicationId: z.string().trim().min(1).max(100),
      applicantName: z.string().trim().min(1).max(150),
      applicationYear: z.number().int().min(2027),
      applicationData: strApplicationDataSchema,
    })
    .superRefine((data, ctx) => {
      if (data.applicantName !== data.applicationData.applicant.fullName) {
        ctx.addIssue({
          code: "custom",
          path: ["applicantName"],
          message: "Applicant name must match application data",
        });
      }
    });

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "submitted",
    "under_review",
    "approved",
    "rejected",
  ]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type StrApplicationData = z.infer<typeof strApplicationDataSchema>;
