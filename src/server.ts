import dotenv from 'dotenv'
import express, { Request, Response, NextFunction } from 'express'
import { Pool } from "pg"
import bcrypt from 'bcrypt'

import path from 'path'

dotenv.config({path: path.join(process.cwd(), '.env')})

const app = express()
const port = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const initDB = async () => {
  await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
      phone VARCHAR(20) NOT NULL,
      role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'customer')),
      CONSTRAINT email_lowercase CHECK (LOWER(email) = email),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

initDB().catch(console.error)

//logger middleware

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/v1/auth/signup', async (req: Request, res: Response) => {
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
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role`,
      [name, email.toLowerCase(), hashedPassword, phone, role]
    )
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
})

app.get('/', logger, (req: Request, res: Response) => {
  res.send('Hello World!!')
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
