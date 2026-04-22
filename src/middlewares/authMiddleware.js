import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const isAuthorized = async (req, res, next) => {
  // lấy access token nằm trong request cookie phía client - withCredentials: true
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Token not found'))
    return
  }
  try {
    //verify token
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )
    //hợp lệ => lưu thông tin giải mã vào req để các tầng sau có thể sử dụng
    req.jwtDecoded = accessTokenDecoded

    //cho request đi tiếp
    next()
  } catch (error) {
    //accessToken expire => trả mã lỗi để FE biết gọi refresh Token
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
    }

    //accessToken không hợp lệ ngoài việc bị expire, 401 cho client gọi sign out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }
}

export const authMiddleware = {
  isAuthorized
}