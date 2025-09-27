
import { formatFromStringtoSlug } from '~/utils/formatters'
import { boardModel } from '~/model/boardModel'

const createNew = async (reqBody) => {
  const createBoard = {
    ...reqBody,
    slug: formatFromStringtoSlug(reqBody.title)
  }

  const result = await boardModel.createNew(createBoard)
  const getNewBoard = await boardModel.findOneById(result.insertedId)

  return getNewBoard
}

export const boardService = {
  createNew
}