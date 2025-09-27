
import { formatFromStringtoSlug } from '~/utils/formatters'
import { boardModel } from '~/model/boardModel'

const createNew = async (reqBody) => {
  const createdBoard = {
    ...reqBody,
    slug: formatFromStringtoSlug(reqBody.title)
  }

  const result = await boardModel.createNew(createdBoard)
  const getNewBoard = await boardModel.findOneById(result.insertedId.toString())

  return getNewBoard
}

export const boardService = {
  createNew
}