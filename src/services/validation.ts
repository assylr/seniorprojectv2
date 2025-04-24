// src/services/validation.ts
import { z } from 'zod';

// --- Basic Reusable Schemas ---

// Basic non-empty string validation helper
const requiredString = (message = "This field is required") =>
    z.string({ required_error: message }) // Use required_error for checking undefined/null
     .min(1, { message }); // Ensure it's not empty after trimming potentially

// Optional string (allows empty string, undefined, null)
const optionalString = z.string().optional().nullable();

// Email validation (allows empty/null)
const emailSchema = z.string({ invalid_type_error: "Invalid email address" })
    .email({ message: "Invalid email address format" })
    .optional() // Make it optional
    .nullable() // Allow null
    .or(z.literal('')); // Also allow empty string explicitly if needed

// Basic phone validation (adjust regex as needed for your specific format requirements)
// This is a simple example; real-world phone validation can be complex.
const phoneRegex = /^\+?[\d\s-()]{7,}$/; // Example: Min 7 digits, allows +, -, spaces, ()
const phoneSchema = z.string()
    .refine((val) => !val || phoneRegex.test(val), { // Only validate if a value is present
        message: "Invalid phone number format",
    })
    .optional() // Make it optional
    .nullable() // Allow null
    .or(z.literal('')); // Also allow empty string

// Optional positive number
const optionalPositiveNumber = z.number()
    .positive({ message: "Must be a positive number" })
    .optional()
    .nullable();

// Optional positive integer
const optionalPositiveInteger = z.number()
    .int({ message: "Must be a whole number" })
    .positive({ message: "Must be a positive number" })
    .optional()
    .nullable();

// Helper for optional date string validation (YYYY-MM-DD format)
const dateStringSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" })
    .optional()
    .nullable()
    .or(z.literal('')); // Allow empty string


export const tenantFormSchema = z.object({
    name: requiredString("First name is required"),
    surname: requiredString("Last name is required"),
    school: optionalString, // Matches form field 'school'
    position: optionalString, // Matches form field 'position'
    tenantType: z.enum(['FACULTY', 'STAFF', 'RENTOR'], { // Added RENTOR
        required_error: "Tenant type is required",
        invalid_type_error: "Invalid tenant type",
    }),
    mobile: phoneSchema, // Assumes phoneSchema handles optional/nullable
    email: emailSchema, // Assumes emailSchema handles optional/nullable
    // Use form field names:
    checkInDate: dateStringSchema, // Validates the string input
    expectedDepartureDate: dateStringSchema, // Validates the string input

    // buildingId is mainly for form logic, maybe not strictly needed in validation schema
    // unless you require a building to be selected. Add if needed:
    // buildingId: requiredString("Building is required").nullable().optional(),

    // Room ID can be number or null (if not assigned)
    roomId: z.number({ invalid_type_error: "Invalid room ID format." })
        .positive({ message: "Invalid room ID." })
        .nullable(), // Allow null

    // familyMembers: z.any().nullable().optional(), // Add if needed and validation isn't complex here

}).refine(data => {
    // Example cross-field validation: departure date must be after arrival date if both provided
    if (data.checkInDate && data.expectedDepartureDate) {
        try {
            return new Date(data.expectedDepartureDate) >= new Date(data.checkInDate);
        } catch {
            return false; // Invalid date format handled by field validation
        }
    }
    return true; // Pass if one or both dates are missing
}, {
    message: "Expected departure date must be on or after the arrival date.",
    path: ["expectedDepartureDate"], // Indicate which field the error relates to
});