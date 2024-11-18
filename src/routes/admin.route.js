import adminController from '../controllers/admin.controller'
import userMiddleware from '../middleware/user.middleware'
import upload from '../config/uploadConfig/index'

const InitRouteAdmin = (route) => {
  route
    .route('/create-author')
    .post(userMiddleware.checkJWT, adminController.createAuthor)

  route
    .route('/update-author')
    .put(userMiddleware.checkJWT, adminController.createAuthor)

  route
    .route('/get-all-author')
    .get(userMiddleware.checkJWT, adminController.getAllAuthor)

  route
    .route('/create-category')
    .post(
      userMiddleware.checkJWT,
      upload.single('image'),
      adminController.createCategory
    )

  route.route('/get-all-category').get(adminController.getAllCategory)

  route
    .route('/create-major')
    .post(userMiddleware.checkJWT, adminController.createMajor)

  route.route('/get-all-major').get(adminController.getAllMajor)
  route
    .route('/create-config')
    .post(userMiddleware.checkJWT, adminController.createLibraryConfig)
  route.route('/get-config').get(adminController.getLibraryConfig)
  route
    .route('/get-list-amount-request')
    .get(userMiddleware.checkJWT, adminController.getListAmountRequest)
  route
    .route('/accept-amount-request')
    .post(userMiddleware.checkJWT, adminController.acceptAmountRequest)
  route.route('/get-banks').get(adminController.findAllBankFromThirdPartyVietQr)
  route
    .route('/config-bank-account')
    .post(userMiddleware.checkJWT, adminController.configBankAccount)
  route.route('/get-bank-account').get(adminController.getBankAccount)
  route
    .route('/reject-amount-request')
    .post(userMiddleware.checkJWT, adminController.rejectAmountRequest)
  route
    .route('/get-all-user')
    .get(userMiddleware.checkJWT, adminController.getAllUser)
  route
    .route('/search-user')
    .get(userMiddleware.checkJWT, adminController.searchUser)
  return route
}
module.exports = InitRouteAdmin
