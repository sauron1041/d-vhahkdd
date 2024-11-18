import userMiddleware from '../middleware/user.middleware'
import bookController from '../controllers/book.controller'
import recommendController from '../controllers/recommend.controller'
import upload from '../config/uploadConfig/index'

const InitRoutesBook = (router) => {
  router
    .route('/create')
    .post(
      userMiddleware.checkJWT,
      upload.single('image'),
      bookController.create
    )
  router.route('/update').put(bookController.update)
  router.route('/remove/:id').delete(bookController.remove)
  router
    .route('/add-chapter')
    .post(
      userMiddleware.checkJWT,
      upload.single('file'),
      bookController.addChapter
    )
  router.route('/get-book-by-id/:id').get(bookController.getBookById)
  router.route('/search').get(bookController.search)
  router.route('/get-detail-book/:id').get(bookController.getDetailBookById)
  router.route('/get-book-type').get(bookController.getBookType)
  router.route('/get-book-review').get(bookController.getBookReview)
  router.route('/get-top-views-book').get(bookController.getTopViewedBooks)
  router
    .route('/get-detail-chapter/:id')
    .get(bookController.getDetailChapterById)
  router.route('/get-related-books/:id').get(bookController.getRelatedBooks)
  router
    .route('/find-books-by-text-input')
    .get(bookController.findBooksByTextInput)
  router
    .route('/get-book-by-category/:id')
    .get(bookController.getBookByCategory)
  router.route('/get-new-books').get(bookController.getNewBooks)
  router.route('/get-recommend-books').get(recommendController.recommendBook)
  router
    .route('/add-multi-chapters')
    .post(
      userMiddleware.checkJWT,
      upload.single('file'),
      bookController.addMultipleChapters
    )
  router
    .route('/add-chapter-by-outline')
    .post(
      userMiddleware.checkJWT,
      upload.single('file'),
      bookController.addMultiChapterByOutline
    )
  router
    .route('/delete-chapter')
    .post(userMiddleware.checkJWT, bookController.deleteChapter)
  return router
}

module.exports = InitRoutesBook
