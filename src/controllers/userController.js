import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const register = async (req, res, next) => {
  try {
    const registedUser = await userService.register(req.body)
    res.status(StatusCodes.CREATED).json(registedUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const verifiedUser = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(verifiedUser)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const loggedInUser = await userService.login(req.body)

    //xử lí trả về http only cookie cho phía trình duyệt
    res.cookie('accessToken', loggedInUser.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', loggedInUser.refreshToken,{
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(loggedInUser)
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedout: true })
  } catch (error) { next(error )}
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookie?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please sign in! (Error from refresh token)'))
  }
}
export const userController = {
  register,
  login,
  verifyAccount,
  logout,
  refreshToken
}