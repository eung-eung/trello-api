
import { formatFromStringtoSlug } from '~/utils/formatters'
import { boardModel } from '~/model/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cardModel } from '~/model/cardModel'
import { columnModel } from '~/model/columnModel'

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
    updatedAt: Date.now()
  }
  const updatedBoard = await boardModel.update(boardId, updatedData)
  return updatedBoard
}

//di chuyển card giữa các column khác nhau trong 1 board

//2. thêm cardId vào column drop vào (update nextCardOrderIds)
//3. update columnId mới cho card
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    const { currentCardId, nextColumnId, nextCardOrderIds, prevColumnId, prevCardOrderIds } = reqBody
    //1. xoá cardId khỏi column ban đầu (update prevCardOrderIds)
    await columnModel.update(prevColumnId, {
      cardOrderIds: prevCardOrderIds,
      updatedAt: Date.now()
    })

    //2. thêm cardId vào column drop vào (update nextCardOrderIds)
    await columnModel.update(nextColumnId, {
      cardOrderIds: nextCardOrderIds,
      updatedAt: Date.now()
    })

    //3. update columnId mới cho card
    await cardModel.update(currentCardId, {
      columnId: nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: 'Successful' }
  } catch (error) { throw new Error(error) }

}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}