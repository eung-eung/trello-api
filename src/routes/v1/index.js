import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute.js'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 is running', StatusCodes: StatusCodes.OK })
})

/* Board APIs */
Router.use('/boards', boardRoute)

export const APIs_V1 = Router