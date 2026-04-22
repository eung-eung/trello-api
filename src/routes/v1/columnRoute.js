import express from 'express'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { columnValidation } from '~/validations/columnValidation'

const Router = express.Router()

Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    columnValidation.createNew,
    columnController.createNew
  )

Router.route('/:columnId')
  .put(
    authMiddleware.isAuthorized,
    columnValidation.update,
    columnController.update
  )
  .patch(
    authMiddleware.isAuthorized,
    columnValidation.deleteColumn,
    columnController.deleteColumn
  )

export const columnRoute = Router