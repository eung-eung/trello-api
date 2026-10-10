import JWT from 'jsonwebtoken'

// payload: thông tin đính kèm trong token ( thường là thông tin user)
// secretKey: chuỗi bí mật dùng để mã hóa token ( thường là 1 chuỗi ngẫu nhiên khó đoán)
// options: thời gian sống của token, thuật toán mã hóa, ...
const generateToken = async(userInfo, secretSignature, tokenLife) => {
  try {
    const token = JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256', expiresIn: tokenLife
    })
    return token
  } catch (error) {
    throw new Error(error)
  }
}

//kiểm tra 1 token có hợp lệ không
// hợp lệ nghĩa là token được tạo ra có đúng với secretSignature hay không
const verifyToken = async(token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}