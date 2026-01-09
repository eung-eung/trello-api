import Joi, { valid } from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/model/columnModel'
import { cardModel } from '~/model/cardModel'

//define Name & Schema
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().min(3).max(50).required().trim().strict(),
  slug:Joi.string().min(3).max(50).required().trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().valid(...BOARD_TYPES).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//chỉ định ra những fields mà mình không muốn cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

//query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về Board
const getDetails = async (boardId) => {
  try {
    // const board = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(String(boardId))
    // })

    //aggregate join bảng Board -> Column, Board -> Card
    const board = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(boardId)),
        _destroy: false
      } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $addFields: { //add/ghi đè field columns
        columns: {
          $map: {
            input:'$columns', //field "columns" (field này đã lookup ở trên)
            as: 'col', //đặt tên biến đại diện cho từng phần tử (một column)
            in: { //định nghĩa object trả về cho mỗi column
              $mergeObjects:[ //Gộp 2 object thành 1 (col + cards)
                '$$col', //giá trị column hiện tại (object gốc)
                {
                  cards: {
                    $filter: {
                      input: '$cards', //đầu vào là cards đã lookup ở trên
                      as:'card',
                      cond: { $eq: ['$$card.columnId', '$$col._id'] } //lọc lấy những card có columnId === col._id
                    }
                  }
                }
              ]
            }
          }
        }
      } },
      { $project: { cards: 0 } } //xoá field cards đã look up vì đã merge nó vào trong từng column
    ]).toArray()

    return board[0] || null
  } catch (error) { throw new Error(error) }
}

//push columnId vào cuối mảng columnOrderIds trong board
const pushToColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after', includeResultMetadata: false }
    )
    // (MongoDB Node.js driver ≥ v6) => includeResultMetadata: false để không cần result.value
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (boardId, updateData) => {
  try {
    //lọc những field mà chúng ta không cho phép update
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    //xử lí thêm validation nếu request có field columnOrderIds
    updateData.columnOrderIds = updateData.columnOrderIds?.map(id => new ObjectId(String(id)))
    if (updateData.columnOrderIds) {
      const columnOrderIdsFromClient = updateData.columnOrderIds
      const board = await findOneById(boardId)

      if (!board) throw new Error('Board not found')

      const validColumnOrderIds = board.columnOrderIds.map(id => new ObjectId(String(id)))

      //check duplicate
      if (columnOrderIdsFromClient.length !== new Set(columnOrderIdsFromClient).size) {
        throw new Error('Duplicate column id in request!')
      }

      //kiểm tra số lượng id trong mảng
      if (validColumnOrderIds.length !== columnOrderIdsFromClient.length) {
        throw new Error('Mismatched columnOrderIds!!')
      }

      //check valid orderColumnIds từ request có giống với trong data hiện tại không
      const isValidColumnOrder = columnOrderIdsFromClient.every(clientId => validColumnOrderIds.some(validId => validId.equals(clientId)))
      if (!isValidColumnOrder ) {
        throw new Error('Invalid column id in columnOrderIds!')
      }
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument:'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushToColumnOrderIds,
  update
}