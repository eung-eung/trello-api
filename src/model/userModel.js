import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

// define role
const USER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLE.CLIENT, USER_ROLE.ADMIN).default(USER_ROLE.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'email', 'username']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (userData) => {
  try {
    const validData = await validateBeforeCreate(userData)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (email) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneById = async (userId) => { 
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(String(userId)) })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (userId, updateData) => {
  try {
    //filter những key không được phép update
    Object.keys(updateData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(userId)) },
      { $set: { ...updateData } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}
export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLE,
  create,
  findOneByEmail,
  update,
  findOneById
}