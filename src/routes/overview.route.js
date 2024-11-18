import overviewService from '../controllers/overview.controller'
import userMiddleware from '../middleware/user.middleware'
const InitRouteOverview = (route) => {
  route
    .route('/transaction-overview')
    .get(userMiddleware.checkJWT, overviewService.getTransactionOverview)
  route
    .route('/revenue-over-time')
    .get(userMiddleware.checkJWT, overviewService.getRevenueOverTime)
  route
    .route('/top-users-by-deposit')
    .get(userMiddleware.checkJWT, overviewService.getTopUsersByDepositAmount)
  route
    .route('/average-processing-time')
    .get(userMiddleware.checkJWT, overviewService.getAverageProcessingTime)
  route
    .route('/user-deposit-rate')
    .get(userMiddleware.checkJWT, overviewService.getUserDepositRate)
  route
    .route('/top-view')
    .get(userMiddleware.checkJWT, overviewService.getTopBooksByViews)
  route
    .route('/export-excel-file')
    .get(userMiddleware.checkJWT, overviewService.exportExcelFile)
  route
    .route('/get-read-time-overview')
    .get(userMiddleware.checkJWT, overviewService.getReadTimeOverviewData)
  route
    .route('/update-read-time')
    .post(userMiddleware.checkJWT, overviewService.updateReadTime)

  return route
}
module.exports = InitRouteOverview
