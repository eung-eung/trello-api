import Joy from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const correctCondition = Joy.object({
    title: Joy.string().required().min(3).max(50).trim().strict(),
    description:Joy.string().required().min(3).max(256).trim().strict()
  })

  try {
    //abortEarly: true => trả về lỗi đầu tiên
    //abortEarly: false => trả về tất cả lỗi nếu trong trường hợp có nhiều lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })

    res.status(StatusCodes.CREATED).json({ message: 'POST from validation: API create new board' })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}


export const boardValidation = {
  createNew
}