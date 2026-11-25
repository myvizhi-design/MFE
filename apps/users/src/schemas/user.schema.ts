import { z } from 'zod';

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be at most 50 characters`)
    .regex(/^[\p{L}' -]+$/u, `${label} can only contain letters, spaces, ' and -`);

/** Single source of truth for user form validation (types are inferred from it). */
export const userSchema = z.object({
  firstName: name('First name'),
  lastName: name('Last name'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-z0-9._]+$/i, 'Use letters, numbers, dot or underscore only'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number (7–20 digits)')
    .or(z.literal('')),
  age: z
    .number({ error: 'Age is required' })
    .int('Age must be a whole number')
    .min(18, 'User must be at least 18')
    .max(100, 'Age must be 100 or less'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Select a gender' }),
  role: z.enum(['admin', 'moderator', 'user'], { error: 'Select a role' }),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const emptyUser: UserFormValues = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  age: Number.NaN,
  gender: 'female',
  role: 'user',
};
