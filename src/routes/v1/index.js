import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute.js'
import { cardRoute } from './cardRoute.js'
import { columnRoute } from './columnRoute.js'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 is running', StatusCodes: StatusCodes.OK })
})

/* Board APIs */
Router.use('/boards', boardRoute)

/* Column APIs */
Router.use('/columns', columnRoute)

/* Card APIs */
Router.use('/cards', cardRoute)

export const APIs_V1 = Router