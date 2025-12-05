import { Pool } from "pg"
import { config } from "."
 
 export const pool = new Pool({
    connectionString: config.connectionString as string
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
  

export default initDB