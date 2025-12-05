import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import { Pool } from "pg"

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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
