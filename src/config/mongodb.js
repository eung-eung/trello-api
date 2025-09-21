import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'


//khởi tạo đối tượng trelloDatabaseInstance
let trelloDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGDOB_URI, {
  serverApi:{
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//kết nối database
export const CONNECT_DB = async () => {
  //gọi kết nối tới MONGODB Atlas đã khai báo trong thân của clientInstance
  await mongoClientInstance.connect()


  //kết nối thành công thì lấy ra Database theo tên và gán vào biến trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATASEBASE_NAME)
}

//export Trello Database Instance sau khi đã connect thành công tới MOngoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong project
//phải đảm bảo chỉ luôn gọi cái GET_DB sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if ( !trelloDatabaseInstance) throw new Error('MongoDB is not connected')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}