'use server'

import { prisma } from '@/prisma/prisma'
import bcrypt from 'bcryptjs'

// Disable Edge runtime for Prisma compatibility
//export const runtime = 'nodejs'

export async function registerUser(formData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  try {
    // Validate input
    if (!formData.email || !formData.password) {
      return { error: 'Email and password are required' }
    }

    if (formData.password !== formData.confirmPassword) {
      return { error: 'Passwords do not match' }
    }

    if (formData.password.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(formData.password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: hashedPassword,
      },
    })

    // Return success
    return { 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'An error occurred during registration' }
  }
}
