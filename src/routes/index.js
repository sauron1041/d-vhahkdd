import express from 'express'
import InitRoutesAuthentication from '../routes/auth.route'
import InitRoutesUsers from '../routes/user.route'
import InitRoutesBook from '../routes/book.route'
import InitRoutesImageUpload from '../routes/image_upload.route'
import InitRouteAdmin from '../routes/admin.route'
import InitRouteOverview from '../routes/overview.route'

const router = express.Router()

const configRoutes = async (app) => {
  app.get('/health', (req, res) => {
    return res.status(200).send({
      status: 'OK',
      message: 'Server is up and running',
    })
  })
  app.use('/auth', InitRoutesAuthentication(router))
  app.use('/user', InitRoutesUsers(router))
  app.use('/book', InitRoutesBook(router))
  app.use('/image', InitRoutesImageUpload(router))
  app.use('/admin', InitRouteAdmin(router))
  app.use('/overview', InitRouteOverview(router))
}

module.exports = configRoutes
