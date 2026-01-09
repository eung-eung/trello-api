import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

//validate dữ liệu khi tạo mới board
const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().message({
      'any.required': 'Title is required for board',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title length must be at least 3 characters',
      'string.max': 'Title must be less than or equal to 5 characters',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description:Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...BOARD_TYPES).required()
  })

  try {
    //abortEarly: true => trả về lỗi đầu tiên
    //abortEarly: false => trả về tất cả lỗi nếu trong trường hợp có nhiều lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

//validate dữ liệu khi cập nhật board
const update = async (req, res, next) => {
  try {
    const correctCondition = Joi.object({
      title: Joi.string().min(3).max(50).trim().strict(),
      description:Joi.string().min(3).max(256).trim().strict(),
      type: Joi.string().valid(...BOARD_TYPES),
      columnOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
    })

    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

//validate dữ liệu khi di chuyển card giữa các column khác nhau trong 1 board
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const correctCondition = Joi.object({
      currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

      nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      nextCardOrderIds: Joi.array().required().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      ),

      prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      prevCardOrderIds: Joi.array().required().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
    })

    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}