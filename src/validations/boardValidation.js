import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

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


export const boardValidation = {
  createNew
}