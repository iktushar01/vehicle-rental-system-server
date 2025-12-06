import app from './app'
import { config } from './config'
import initDB from './config/db'

const port = config.port

// Initialize database
initDB().catch(console.error)

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
