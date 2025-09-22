/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index.js'

const START_SERVER = () => {
  const app = express()

  app.use('/v1', APIs_V1)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Server is running at http://${env.APP_HOST}:${env.APP_PORT}`)
  })

  exitHook((callback) => {
    console.log('Server is shutting down...')
    CLOSE_DB().then( () => {
      console.log('MongoDB connection closed')
      callback()
    }).catch( (error) => {
      console.error('Error during MongoDB disconnection', error)
      callback()
    }) })
}

//IIFE
(async () => {
  try {
    await CONNECT_DB()
    console.log('Connected to MongoDB')

    START_SERVER()
  } catch (error) {
    console.error('Failed to connect to MongoDB', error)
    process.exit(0)
  }
})()

