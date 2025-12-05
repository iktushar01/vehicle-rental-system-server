import { pool } from "../../config/db";
import bcrypt from 'bcrypt'

const hashedPassword = (password: string) => bcrypt.hash(password, 10)
const signup = async (name: string, email: string, password: string, phone: string, role: string) => {
  return await pool.query(
    `INSERT INTO users (name, email, password, phone, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashedPassword, phone, role]
  ) }

  export const authService = {
    signup
  }