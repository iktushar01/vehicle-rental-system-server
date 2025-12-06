import { pool } from "../../config/db";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../config'

const hashedPassword = (password: string) => bcrypt.hash(password, 10)

const signup = async (name: string, email: string, password: string, phone: string, role: string) => {
  const hashed = await hashedPassword(password)
  return await pool.query(
    `INSERT INTO users (name, email, password, phone, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashed, phone, role]
  ) }

const signin = async (email: string, password: string) => {
  return await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )
}

const generateToken = (userId: number, email: string, role: string): string => {
  return jwt.sign(
    { 
      id: userId, 
      email: email, 
      role: role 
    },
    config.jwtSecret as string,
    { expiresIn: '7d' }
  )
}

  export const authService = {
    signup,
    signin,
    generateToken
  }