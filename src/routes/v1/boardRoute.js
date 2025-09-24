import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController}  from '~/controllers/boardController'

const Router = express.Router()

/*  v1/boards  */
Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get board list' })
  })
  .post(boardValidation.createNew, boardController.createNew)

export const boardRoute = Router