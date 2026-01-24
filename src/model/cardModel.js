import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { boardModel } from './boardModel'
import { columnModel } from './columnModel'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  deletedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const validationBeforeCreate = async (data) => {
  const validCard = await CARD_COLLECTION_SCHEMA.validateAsync(data)
  const validBoardId = await boardModel.findOneById(validCard.boardId)
  const validColumnId = await columnModel.findOneById(validCard.columnId)

  if (!validBoardId || !validColumnId) {
    throw new Error(!validBoardId ? 'Board does not exist!' : 'Column does not exist!')
  }

  //kiểm tra boardId ở card và ở column có giống nhau không
  if (!validColumnId.boardId.equals(validCard.boardId)) {
    throw new Error('Column does not belong to the specified board!')
  }

  return validCard
}

const createNew = async (data) => {
  try {
    const validData = await validationBeforeCreate(data)
    const cardToInsert = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId)),
      columnId: new ObjectId(String(validData.columnId))
    }
    const newCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(cardToInsert)
    return newCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (cardId) => {
  try {
    const card = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(cardId))
    })
    return card
  } catch (error) { throw new Error(error) }
}

const update = async (cardId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updatedData[key]
      }}
    )

    //format dữ liệu có liên quan tới ObjectId
    if (updatedData.columnId) updatedData.columnId = new ObjectId(String(updatedData.columnId))

    const card = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(cardId)) },
      { $set: updatedData },
      { returnDocument: 'after' }
    )
    return card
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update
}