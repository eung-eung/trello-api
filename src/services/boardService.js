
import { formatFromStringtoSlug } from '~/utils/formatters'
import { boardModel } from '~/model/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  const createdBoard = {
    ...reqBody,
    slug: formatFromStringtoSlug(reqBody.title)
  }

  const result = await boardModel.createNew(createdBoard)
  const newBoard = await boardModel.findOneById(result.insertedId.toString())

  return newBoard
}

const getDetails = async (boardId) => {
  const board = await boardModel.getDetails(boardId)
  if (!board) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
  }
  return board
}

const update = async (boardId, reqBody) => {
  const updatedData = {
    ...reqBody,
    updatedAt: Date.now(),
  }
  const updatedBoard = await boardModel.update(boardId, updatedData)
  return updatedBoard
}
export const boardService = {
  createNew,
  getDetails,
  update
}