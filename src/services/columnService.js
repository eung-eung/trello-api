import { boardModel } from '~/model/boardModel'
import { columnModel } from '~/model/columnModel'

const createNew = async (body) => {
  try {
    const result = await columnModel.createNew(body)
    const newColumn = await columnModel.findOneById(result.insertedId)
    if (newColumn) {
      newColumn.cards = []

      //cập nhật mảng columnOrderIds trong collection Boards
      await boardModel.pushToColumnOrderIds(newColumn)
    }
    return newColumn
  } catch (error) { throw new Error(error) }
}

export const columnService = {
  createNew
}