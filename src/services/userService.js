import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/model/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAINS } from '~/utils/constants'
import { renderTemplate } from '~/utils/renderTemplate'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '../config/environment.js'
import { JwtProvider } from '~/providers/JwtProvider.js'

const register = async (reqBody) => {
  // kiểm tra xem email đã tồn tại trong hệ thống hay chưa
  const existingUser = await userModel.findOneByEmail(reqBody.email)
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
  }

  const nameFromEmail = reqBody.email.split('@')[0]
  const hashedPassword = await bcrypt.hash(reqBody.password, 10)
  const newUser = {
    email: reqBody.email,
    password: hashedPassword,
    username: nameFromEmail,
    displayName: nameFromEmail,

    verifyToken: uuidv4()
  }

  const createdUser = await userModel.create(newUser)
  if (!createdUser) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user')
  }

  const getNewUser = await userModel.findOneById(createdUser.insertedId)

  const verificationLink = `${WEBSITE_DOMAINS}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
  const htmlData = {
    name: getNewUser.displayName,
    verificationLink
  }
  const emailTemplate = renderTemplate('verifyEmail.html', htmlData)

  // gọi tới provider
  await BrevoProvider.sendEmail({
    to: getNewUser.email,
    subject: 'Verify your email before using my service',
    html: emailTemplate,
    name: getNewUser.displayName
  })
  return pickUser(getNewUser)
}

const login = async (reqBody) => {
  const existingUser = await userModel.findOneByEmail(reqBody.email)
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  }

  if (!existingUser.isActive) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account is not active. Please verify your email.')
  }

  const isMatchPassword = await bcrypt.compare(reqBody.password, existingUser.password)
  if (!isMatchPassword) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your email or password is incorrect')
  }

  // tạo thông tin để đính kèm trong JWT token: _id + email
  const userInfoForToken = {
    _id: existingUser._id,
    email: existingUser.email
  }
  //tạo token ( refresh token, access token) rồi trả về cho client
  const accessToken = await JwtProvider.generateToken(
    userInfoForToken,
    env.ACCESS_TOKEN_SECRET_SIGNATURE,
    // 5
    env.ACCESS_TOKEN_LIFE
  )

  const refreshToken = await JwtProvider.generateToken(
    userInfoForToken,
    env.REFRESH_TOKEN_SECRET_SIGNATURE,
    env.REFRESH_TOKEN_LIFE
  )

  //trả về client thông tin user và 2 token
  return { accessToken, refreshToken, ...pickUser(existingUser) }
}

const verifyAccount = async (reqBody) => {
  const existingUser = await userModel.findOneByEmail(reqBody.email)
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
  }

  if (existingUser.isActive) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Account is already active')
  }

  if (existingUser.verifyToken !== reqBody.token) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')
  }

  // update user
  const updatedData = {
    isActive: true,
    verifyToken: null
  }

  const updatedUser = await userModel.update(existingUser._id, updatedData)
  return pickUser(updatedUser)
}

const refreshToken = async (refreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      refreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    //tạo access token mới, chỉ lưu thông tin unique + cố định từ user, đã có trong token rồi
    //có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )
    return { accessToken }

  } catch (error) { throw new Error( error)}
}
export const userService = {
  register,
  login,
  verifyAccount,
  refreshToken
}