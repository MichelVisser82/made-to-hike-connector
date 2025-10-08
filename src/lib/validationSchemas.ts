import { z } from 'zod';

/**
 * Centralized validation schemas using Zod for input validation
 * Implements security best practices with strict length limits and sanitization
 */

// Email validation with strict length limit
const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Invalid email address' })
  .min(5, { message: 'Email must be at least 5 characters' })
  .max(255, { message: 'Email must be less than 255 characters' })
  .toLowerCase();

// Password validation with security requirements
const passwordSchema = z
  .string()
  .min(6, { message: 'Password must be at least 6 characters' })
  .max(128, { message: 'Password must be less than 128 characters' });

// Name validation with reasonable limits
const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be less than 100 characters' });

// Phone validation with international format support
const phoneSchema = z
  .string()
  .trim()
  .min(7, { message: 'Phone number must be at least 7 characters' })
  .max(20, { message: 'Phone number must be less than 20 characters' })
  .regex(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' });

// Contact form validation schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .max(200, { message: 'Subject must be less than 200 characters' })
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(2000, { message: 'Message must be less than 2000 characters' }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z
    .string()
    .trim()
    .max(100, { message: 'Name must be less than 100 characters' })
    .optional(),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;

// Hiker registration schema
export const hikerRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  emergency_contact: nameSchema,
  emergency_phone: phoneSchema,
});

export type HikerRegistrationData = z.infer<typeof hikerRegistrationSchema>;

// Guide signup basic info schema
export const guideSignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
  company_name: z
    .string()
    .trim()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(200, { message: 'Company name must be less than 200 characters' })
    .optional(),
  license_number: z
    .string()
    .trim()
    .max(100, { message: 'License number must be less than 100 characters' })
    .optional(),
  experience_years: z
    .number()
    .int()
    .min(0, { message: 'Experience must be 0 or more years' })
    .max(70, { message: 'Experience must be less than 70 years' })
    .optional(),
  insurance_info: z
    .string()
    .trim()
    .max(500, { message: 'Insurance info must be less than 500 characters' })
    .optional(),
});

export type GuideSignupData = z.infer<typeof guideSignupSchema>;

// User signup schema (generic)
export const userSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
});

export type UserSignupData = z.infer<typeof userSignupSchema>;

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize URL input
 */
export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be less than 2048 characters' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTP or HTTPS protocol' }
  );
