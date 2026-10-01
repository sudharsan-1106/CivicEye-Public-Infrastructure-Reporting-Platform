import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must match'),
  role: z.enum(['citizen', 'department_officer', 'field_engineer', 'administrator']).default('citizen'),
  departmentId: z.string().uuid().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must match'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const complaintSchema = z.object({
  categoryId: z.string().uuid('Please select an issue category'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(15, 'Please provide a detailed description (min 15 characters)'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  address: z.string().min(5, 'Please provide a valid location address or landmark'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export const verificationSchema = z.object({
  action: z.enum(['verify', 'reject']),
  departmentId: z.string().uuid().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  remarks: z.string().min(3, 'Please provide verification or rejection remarks'),
});

export const assignmentSchema = z.object({
  engineerId: z.string().uuid('Please select an active field engineer'),
  instructions: z.string().optional(),
});

export const progressUpdateSchema = z.object({
  action: z.enum(['IN_PROGRESS', 'RESOLVED']),
  notes: z.string().min(5, 'Please provide descriptive notes regarding your work progress'),
});

export const closeComplaintSchema = z.object({
  remarks: z.string().min(3, 'Please provide closing verification remarks'),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(7, 'Please provide a valid phone number').optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const departmentSchema = z.object({
  name: z.string().min(3, 'Department name is required'),
  code: z.string().min(2, 'Department code is required').toUpperCase(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(3, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().default('AlertTriangle'),
  departmentId: z.string().uuid().optional().nullable(),
  defaultPriority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  slaHours: z.number().min(1, 'SLA hours must be at least 1').default(72),
  isActive: z.boolean().default(true),
});
