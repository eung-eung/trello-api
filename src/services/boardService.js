
import { formatFromStringtoSlug } from '~/utils/formatters'

const createNew = async (reqBody) => {
  const createdBoard = {
    ...reqBody,
    slug: formatFromStringtoSlug(reqBody.title)
  }

  return createdBoard
}

export const boardService = {
  createNew
}