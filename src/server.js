import express from 'express'

const app = express()
const port = 3000
const localhost = 'localhost'

app.get('/', (req, res) => {
  return res.send('Hello World!')
})

app.listen(port, localhost, () => {
  console.log(`Server is running at http://${localhost}:${port}`)
})
