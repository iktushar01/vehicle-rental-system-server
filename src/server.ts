import express, { Request, Response } from 'express'
import { config } from './config'
import initDB from './config/db'
import logger from './middleware/logger'
import { authRoutes } from './modules/auth/auth.routes'
import { usersRoutes } from './modules/users/users.routes'


const app = express()
const port = config.port



initDB().catch(console.error)


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/v1/auth', authRoutes)
app.use('/v1/users', usersRoutes)

app.get('/', logger, (req: Request, res: Response) => {
  res.send('Hello World!!')
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})


app.listen( port, () => {
  console.log(`Example app listening on port ${port}`)
})
