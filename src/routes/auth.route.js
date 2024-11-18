import appController from '../controllers/app.controller'
import userMiddleware from '../middleware/user.middleware'

const InitRoutesAuthentication = (router) => {
  router.route('/register').post(appController.register)

  router.route('/login').post(appController.login)

  router.route('/logout').post(appController.logout)

  router.route('/check').post(appController.check)

  router.route('/verify').post(appController.verifyUser)
  router.route('/reset-password').post(appController.resetPassword)

  router
    .route('/change-password')
    .put(userMiddleware.checkJWT, appController.changePassword)

  return router
}

module.exports = InitRoutesAuthentication
