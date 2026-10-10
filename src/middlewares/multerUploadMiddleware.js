import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_TYPE, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

//kiểm tra loại file chấp nhận
const customFileFilter = (req, file, callback) => {
  console.log('Multer file: ', file)
  //multer thì kiểu file sử dụng mimetype
  if (!ALLOW_COMMON_TYPE.includes(file.mimetype)) {
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'File type is invalid. Only accept jpg, jpeg, png'), null)
  }

  //file hợp lệ
  return callback(null, true)
}

const upload = multer({
  limits: { fieldSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }