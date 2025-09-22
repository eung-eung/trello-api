import express from 'express'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

/*  v1/boards  */
Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get board list' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'Note: API create new board' })
  })

export const boardRoutes = Router