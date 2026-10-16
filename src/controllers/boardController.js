import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const getBoardList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const userId = req.jwtDecoded._id //  userId trong authMiddleware
    const boardList = await boardService.getBoardList({ page, limit, userId })
    // throw new Error('Test error handling') // Test error handling
    res.status(StatusCodes.OK).json(boardList)
  } catch (error) { next(error) }
}

const createNew = async (req, res, next) => {
  try {
    console.log('boardController createNew', req.body, req.jwtDecoded._id)
    const createdBoard = await boardService.createNew(req.body, req.jwtDecoded._id) //  userId trong authMiddleware

    res.status(StatusCodes.CREATED).json(createdBoard)

  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const boardDetails = await boardService.getDetails(boardId)

    // const responseBoard = cloneDeep(boardDetails)

    // responseBoard.columns.forEach
    res.status(StatusCodes.OK).json(boardDetails)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoardList
}