// src/services/validation.ts
import { z } from 'zod';
// Import your FormData types (adjust path if needed)
// Ensure these types align with the fields used in your Zod schemas
import {
    BuildingFormData,
    RoomFormData,
    TenantFormData,
    ContractFormData,
    PaymentFormData,
    MaintenanceRequestFormData
} from './types';

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


// --- Form Data Schemas ---

// Tenant Form Validation Schema
// Matches the fields in TenantFormData type
export const tenantFormSchema = z.object({
    firstName: requiredString("First name is required"),
    lastName: requiredString("Last name is required"),
    schoolOrDepartment: optionalString,
    position: optionalString,
    tenantType: z.enum(['faculty', 'staff'], {
        required_error: "Tenant type is required", // Error if undefined/null
        invalid_type_error: "Invalid tenant type", // Error if value isn't 'faculty' or 'staff'
    }),
    mobile: phoneSchema,
    email: emailSchema,
    arrivalDate: dateStringSchema,
    expectedDepartureDate: dateStringSchema,
    // Add roomId validation - Ensure this matches TenantFormData
    roomId: z.number({
            required_error: "Room selection is required.",
            invalid_type_error: "Room selection is required.",
        })
        .positive({ message: "Please select a room."})
        .nullable() // Allow null initially before selection
        .refine(val => val !== null, { message: "Room selection is required." }), // Ensure a non-null value is ultimately chosen

    // Note: If using refine based on edit mode, the logic gets more complex
    // e.g., .refine((data) => isEditMode || data.roomId !== null, { ... })
    // This often requires passing context to the resolver. Keeping it simple for now.
});

// Contract Form Validation Schema (Example - Add if/when needed)
// export const contractFormSchema = z.object({
//     tenantId: z.number().positive("Tenant is required"),
//     roomId: z.number().positive("Room is required"),
//     startDate: requiredString("Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
//     endDate: requiredString("End date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
//     monthlyRentAmount: z.number({ required_error: "Monthly rent is required" })
//         .positive({ message: "Rent must be a positive amount" }),
//     notes: optionalString,
// }).refine(data => !data.endDate || !data.startDate || new Date(data.endDate) >= new Date(data.startDate), {
//     message: "End date cannot be before start date",
//     path: ["endDate"], // Point error to end date field
// });

// Payment Form Validation Schema (Example - Add if/when needed)
// export const paymentFormSchema = z.object({
//     contractId: z.number().positive(), // Assuming implicitly known
//     paymentDate: requiredString("Payment date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
//     amount: z.number({ required_error: "Amount is required" })
//         .positive({ message: "Amount must be positive" }),
//     paymentMethod: z.enum(['bank_transfer', 'card', 'cash', 'other']).nullable(),
//     notes: optionalString,
// });

// Building Form Validation Schema (Example - Add if/when needed, assuming buildings are static now)
// export const buildingFormSchema = z.object({
//     buildingType: z.enum(['apartment', 'townhouse', 'cottage'], { required_error: 'Building type is required'}),
//     buildingNumber: requiredString('Building number/name is required'),
//     floorCount: optionalPositiveInteger,
//     totalArea: optionalPositiveNumber,
// });

// Room Form Validation Schema (Example - Add if/when needed for room management)
// export const roomFormSchema = z.object({
//     buildingId: z.number({ required_error: "Building is required" }).positive("Building is required"),
//     roomNumber: requiredString('Room number is required'),
//     bedroomCount: z.number({ required_error: "Bedroom count is required" }).int().min(0, "Cannot be negative"),
//     totalArea: z.number({ required_error: "Area is required" }).positive("Area must be positive"),
//     floorNumber: z.number().int().nullable().optional(),
//     isAvailable: z.boolean(),
//     baseRent: optionalPositiveNumber,
// });

// Maintenance Request Form Validation Schema (Example - Add if/when needed)
// export const maintenanceRequestFormSchema = z.object({
//     roomId: z.number({ required_error: "Room is required"}).min(1, "Room is required"),
//     category: z.enum(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'general', 'other'], { required_error: "Category is required" }),
//     description: requiredString("Description is required"),
//     priority: z.enum(['low', 'medium', 'high', 'emergency'], { required_error: "Priority is required" }),
//     notes: optionalString,
// });


// --- Optional: Type Inference ---
// You can use Zod's inference to automatically create TypeScript types
// from your schemas. This guarantees your types and validation rules match.
// If you use this, you might not need to manually define the FormData types in types.ts.
// export type InferredTenantFormData = z.infer<typeof tenantFormSchema>;
// export type InferredContractFormData = z.infer<typeof contractFormSchema>;
// etc.

// --- Export Schemas ---
// Export the schemas you need for your forms.
// We currently only need the tenantFormSchema implemented.