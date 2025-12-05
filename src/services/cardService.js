import { cardModel } from '~/model/cardModel'
import { columnModel } from '~/model/columnModel'

const createNew = async (body) => {
  try {
    const result = await cardModel.createNew(body)
    const newCard = await cardModel.findOneById(result.insertedId)

    if (newCard) {
      //cập nhật mảng cardOrderIds trong collection Columns
      await columnModel.pushToCardOrderIds(newCard)
    }
    return newCard
  } catch (error) { throw new Error(error) }
}

const updateColumnId = async (cardId, newColumnId) => {
  try {
    const result = await cardModel.updateColumnIdInCard(cardId, newColumnId)
    return result
  } catch (error) { throw new Error(error) }
}
export const cardService = {
  createNew,
  updateColumnId
}