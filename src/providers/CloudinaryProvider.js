import cloudinary from 'cloudinary'
import { env } from '~/config/environment'
import streamifier from 'streamifier'
const cloudinaryV2 = cloudinary.v2

cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const streamUpload = (fileBuffer, folderName, options) => {
  return new Promise((resolve, reject) => {
    //tạo 1 luồng stream upload lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream({ public_id: folderName, ...options }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })

    //thực hiện luồng upload bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { streamUpload }