import userMiddleware from '../middleware/user.middleware'
import imageController from '../controllers/image.controller.js'

const InitRoutesImageUpload = (router) => {
  router.route('/upload').post(userMiddleware.checkJWT, imageController.upload)

  return router
}

module.exports = InitRoutesImageUpload
