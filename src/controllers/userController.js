import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'

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

export const userController = {
  register,
  login,
  verifyAccount
}