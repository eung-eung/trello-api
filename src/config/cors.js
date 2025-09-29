import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from './environment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

export const corsOptions = {
  origin: function(origin, callback) {
    //cho phép gọi API bằng POSTMAN trên môi trường dev,
    //khi sử dụng POSTMAN thì origin có giá trị là undefined
    if (!origin && env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    //kiểm tra origin có phải domain được chấp nhận hay không
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy`))
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204

  //cho phép truyền thông tin xác thực (credentials) trong request cross-origin hay không (cookie, authorization header)
  credentials: true
}