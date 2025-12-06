import type { Request, Response } from 'express'
import { authService } from './auth.service'
import bcrypt from 'bcrypt'

const signup = async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, role } = req.body
  
      // Validate required fields
      if (!name || !email || !password || !phone || !role) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        })
      }
  
      // Validate role
      if (role !== 'admin' && role !== 'customer') {
        return res.status(400).json({
          success: false,
          message: 'Role must be either "admin" or "customer"'
        })
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Insert user into database
      const result = await authService.signup(name, email, hashedPassword, phone, role)
      console.log(result.rows[0])
  
      const user = result.rows[0]
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      })
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        })
      }
  
      console.error('Signup error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }


const signin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        })
      }

      // Get user from database
      const result = await authService.signin(email.toLowerCase(), password)

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
      }

      const user = result.rows[0]

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      // Generate JWT token
      const token = authService.generateToken(user.id, user.email, user.role)

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userWithoutPassword
        }
      })
    } catch (error: any) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }


  export const authController = {
    signup,
    signin
  }