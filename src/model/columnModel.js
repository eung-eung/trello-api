import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { boardModel } from './boardModel'
import { cardModel } from '~/model/cardModel'

const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  deletedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const validateBeforeCreate = async (data) => {
  const validData = await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })

  // kiểm tra xem boardId có tồn tại hay không
  const result =await boardModel.findOneById(validData.boardId)

  if (!result) throw new Error('Board does not exist')

  return validData
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    //convert boardId sang ObjectId
    const columnToInsert = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId))
    }

    const newColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(columnToInsert)
    return newColumn
  } catch (error) { throw new Error(error) }
}

const findOneById = async (columnId) => {
  try {
    const column = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(columnId))
    })
    return column
  } catch (error) { throw new Error(error) }
}

//push cardId vào cuối mảng cardOrderIds trong column
const pushToCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(card.columnId)) },
      { $push: { cardOrderIds: new ObjectId(String(card._id)) } },
      { returnDocument: 'after', includeResultMetadata: false }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const update = async (columnId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updatedData[key]
      }
    })

    if (updatedData.cardOrderIds) {
      const cardOrderIdsFromClient = updatedData.cardOrderIds

      const column = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({ _id: new ObjectId(String(columnId)) })

      if (!column) throw new Error('Column not found')

      //check duplicate
      if (cardOrderIdsFromClient.length !== new Set(cardOrderIdsFromClient).size) {
        throw new Error('Duplicate card id in request!')
      }
    }

    updatedData.cardOrderIds = updatedData.cardOrderIds.map(id => new ObjectId(String(id)))

    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(columnId)) },
      { $set: updatedData },
      { returnDocument:'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteColumn = async (columnId) => {
  try {
    //kiểm tra column có tồn tại hay không
    const validColumn = await findOneById(columnId)
    if (!validColumn) throw new Error('Column not found')

    //xóa column
    await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(columnId)) },
      { $set: { _destroy: true },
        $currentDate: { updatedAt: true, deletedAt: true }
      },
      { returnDocument:'after' }
    )

    //xóa tất cả các card thuộc column đó
    await GET_DB().collection(cardModel.CARD_COLLECTION_NAME).updateMany(
      { columnId: new ObjectId(String(columnId)) },
      {
        $set: { _destroy: true },
        $currentDate: { updatedAt: true, deletedAt: true }
      }
    )
  } catch (error) { throw new Error(error)}
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushToCardOrderIds,
  update,
  deleteColumn
}