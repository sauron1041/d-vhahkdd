import Review from '../config/nosql/models/review.model'
import Comment from '../config/nosql/models/comment.model'
import BookMark from '../config/nosql/models/book-mark.model'
import FollowList from '../config/nosql/models/follow-list.model'
import Notify from '../config/nosql/models/notify.model'
import HotSearch from '../config/nosql/models/hot-search.model'
import ChapterComment from '../config/nosql/models/chapter-comment'
import Chapter from '../config/nosql/models/chapter.model'
import History from '../config/nosql/models/history.model'
import RequestAmount from '../config/nosql/models/requestAmount.model'
import Amount from '../config/nosql/models/amount.model'
import User from '../config/nosql/models/user.model'
import Book from '../config/nosql/models/book.model'
import ViewHistory from '../config/nosql/models/view-history.model'
import { literal } from 'sequelize'

const like = async (userId, bookId) => {
  try {
    if (!userId || !bookId) {
      return {
        errCode: 409,
        message: 'Missing required fields',
      }
    }
    const review = await Review.find({
      bookId: bookId,
    })
    review.totalLike += 1
    const result = await review.save()

    const bookMark = await BookMark.findOne({
      userId: userId,
      bookId: bookId,
    })
    bookMark.like = true
    await bookMark.save()

    if (!result) {
      return {
        errCode: 500,
        message: 'Error updating review',
      }
    } else {
      return {
        errCode: 200,
        message: 'Update review success (like)',
        data: review,
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}
const read = async (userId, bookId, chapterId) => {
  try {
    const review = await Review.findOne({ bookId: bookId })
    if (!review) {
      return {
        errCode: 404,
        message: 'Review not found',
      }
    }

    review.totalView = (review.totalView || 0) + 1
    try {
      await review.save()
    } catch (error) {
      console.error('Error saving review:', error)
      throw new Error('Error updating review.')
    }

    let history = await History.findOne({ userId: userId })
    if (!history) {
      history = await History.create({
        userId: userId,
        books: [
          {
            bookId: bookId,
            lastReadChapterId: chapterId,
            lastReadAt: new Date(),
          },
        ],
        lastReadBook: bookId,
      })
    } else {
      const existingBookIndex = history.books.findIndex(
        (book) => book.bookId.toString() === bookId.toString()
      )
      if (existingBookIndex > -1) {
        history.books[existingBookIndex].lastReadChapterId = chapterId
        history.books[existingBookIndex].lastReadAt = new Date()
      } else {
        history.books.push({
          bookId: bookId,
          lastReadChapterId: chapterId,
          lastReadAt: new Date(),
        })
      }
      history.lastReadBook = bookId
      try {
        await history.save()
      } catch (error) {
        console.error('Error saving history:', error)
        throw new Error('Error updating reading history.')
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let viewHistoryByDate = await ViewHistory.findOne({
      bookId: bookId,
      date: today,
    })
    if (!viewHistoryByDate) {
      viewHistoryByDate = await ViewHistory.create({
        bookId: bookId,
        date: today,
        views: 1,
      })
    } else {
      viewHistoryByDate.views += 1
      try {
        await viewHistoryByDate.save()
      } catch (error) {
        console.error('Error saving view history:', error)
        throw new Error('Error updating view history.')
      }
    }

    return {
      status: 200,
      message: 'Update review success (view)',
      data: review,
    }
  } catch (error) {
    console.error('Error in read function:', error)
    throw new Error(error.message)
  }
}
const rate = async (userId, bookId, rating) => {
  try {
    if (!userId || !bookId || !rating) {
      return {
        errCode: 409,
        message: 'Missing required fields',
      }
    }
    const review = await Review.findOne({
      bookId: bookId,
    })
    if (review.userId === userId) {
      return {
        errCode: 409,
        message: 'User can not rate twice',
        data: review,
      }
    }
    review.rating.push(rating)
    review.rate = review.rating.reduce((a, b) => a + b) / review.rating.length

    const result = await review.save()

    const bookMark = await BookMark.findOne({
      userId: userId,
      bookId: bookId,
    })
    if (!bookMark) {
      await BookMark.create({
        userId: userId,
        bookId: bookId,
        rating: rating,
      })
    }
    bookMark.rating = rating
    await bookMark.save()

    let history = await History.findOne({ userId: userId })
    if (!history) {
      history = await History.create({
        userId: userId,
        books: [
          {
            bookId: bookId,
            lastReadAt: new Date(),
          },
        ],
        rating: [
          {
            bookId: bookId,
            rating: rating,
            ratedAt: new Date(),
          },
        ],
        lastReadBook: bookId,
      })
    } else {
      // Kiểm tra xem cuốn sách đã có trong lịch sử chưa
      const existingBookIndex = history.books.findIndex(
        (book) => book.bookId.toString() === bookId.toString()
      )
      if (existingBookIndex > -1) {
        // Cập nhật thông tin của cuốn sách đã đọc
        history.books[existingBookIndex].lastReadAt = new Date()
      } else {
        // Thêm sách mới vào lịch sử
        history.books.push({
          bookId: bookId,
          lastReadAt: new Date(),
        })
        history.rating.push({
          bookId: bookId,
          rating: rating,
          ratedAt: new Date(),
        })
      }
      try {
        await history.save()
      } catch (error) {
        console.error('Error saving history:', error)
        throw new Error('Error updating reading history.')
      }
    }

    if (!result) {
      return {
        errCode: 500,
        message: 'Error updating review',
      }
    } else {
      return {
        errCode: 200,
        message: 'Update review success (rate)',
        data: review,
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}
const comment = async (userId, bookId, comment) => {
  try {
    if (!userId || !bookId || !comment) {
      return {
        errCode: 409,
        message: 'Missing required fields',
      }
    }
    const review = await Review.findOne({
      bookId: bookId,
    })

    const newComment = await Comment.create({
      reviewId: review._id,
      user: userId,
      content: comment,
      postDate: new Date(),
    })

    review.comments.push(newComment._id)
    const result = await review.save()

    let history = await History.findOne({ userId: userId })
    if (!history) {
      history = await History.create({
        userId: userId,
        books: [
          {
            bookId: bookId,
            lastReadAt: new Date(),
          },
        ],
        comment: [
          {
            bookId: bookId,
            content: comment,
            createdAt: new Date(),
          },
        ],
        lastReadBook: bookId,
      })
    } else {
      // Kiểm tra xem cuốn sách đã có trong lịch sử chưa
      const existingBookIndex = history.books.findIndex(
        (book) => book.bookId.toString() === bookId.toString()
      )
      if (existingBookIndex > -1) {
        // Cập nhật thông tin của cuốn sách đã đọc
        history.books[existingBookIndex].lastReadAt = new Date()
      } else {
        // Thêm sách mới vào lịch sử
        history.books.push({
          bookId: bookId,
          lastReadAt: new Date(),
        })
        history.comment.push({
          bookId: bookId,
          content: comment,
          createdAt: new Date(),
        })
      }
      try {
        await history.save()
      } catch (error) {
        console.error('Error saving history:', error)
        throw new Error('Error updating reading history.')
      }
    }

    if (!result) {
      return {
        errCode: 500,
        message: 'Error updating review',
      }
    } else {
      return {
        errCode: 200,
        message: 'Update review success (comment)',
        data: review,
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}
const createUserBookMark = async (userId, bookId) => {
  try {
    const bookMark = await BookMark.create({
      userId: userId,
      bookId: bookId,
    })
    return {
      status: 200,
      message: 'Create user book mark success',
      data: bookMark,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const updateUserBookMark = async (updateData) => {
  try {
    const {
      userId,
      bookId,
      chapterId,
      lastReadChapterIndex,
      like,
      follow,
      rating,
      notes,
      highLights,
    } = updateData

    let bookMark = await BookMark.findOne({ userId, bookId })

    if (!bookMark) {
      const newBookMark = await BookMark.create({
        userId,
        bookId,
        lastReadChapterId: chapterId || undefined,
        lastReadChapterIndex: lastReadChapterIndex || undefined,
        readChapterIds: chapterId ? [chapterId] : undefined,
        like: like || undefined,
        follow: follow || undefined,
        rating: rating || undefined,
        notes: notes || undefined,
        highLights: highLights || undefined,
      })

      return {
        status: 200,
        message: 'Create BookMark successfully',
        data: newBookMark,
      }
    } else {
      if (chapterId !== undefined) {
        bookMark.lastReadChapterId = chapterId

        if (!bookMark.readChapterIds.includes(chapterId)) {
          bookMark.readChapterIds.push(chapterId)
        }
      }

      if (lastReadChapterIndex !== undefined) {
        bookMark.lastReadChapterIndex = lastReadChapterIndex
      }
      if (like !== undefined) {
        bookMark.like = like
      }
      if (follow !== undefined) {
        bookMark.follow = follow
      }
      if (rating !== undefined) {
        bookMark.rating = rating
      }
      if (notes !== undefined) {
        bookMark.notes = notes
      }
      if (highLights !== undefined) {
        bookMark.highLights = highLights
      }

      await bookMark.save()

      let history = await History.findOne({ userId })
      if (!history) {
        history = await History.create({
          userId,
          books: [
            {
              bookId,
              lastReadChapterId: chapterId,
              lastReadAt: new Date(),
            },
          ],
          lastReadBook: bookId,
        })
      } else {
        const bookInHistory = history.books.find(
          (b) => b.bookId.toString() === bookId.toString()
        )

        if (bookInHistory) {
          bookInHistory.lastReadChapterId = chapterId
          bookInHistory.lastReadAt = new Date()
        } else {
          history.books.push({
            bookId,
            lastReadChapterId: chapterId,
            lastReadAt: new Date(),
          })
        }

        history.lastReadBook = bookId

        await history.save()
      }

      return {
        status: 200,
        message: 'Update BookMark successfully',
        data: bookMark,
      }
    }
  } catch (error) {
    console.error('Error in updateUserBookMark:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getUserBookMark = async (userId, bookId) => {
  try {
    const bookMark = await BookMark.findOne({
      userId: userId,
      bookId: bookId,
    })
    if (bookMark) {
      return {
        status: 200,
        message: 'Get user book mark success',
        data: bookMark,
      }
    } else {
      const newBookMark = await BookMark.create({
        userId: userId,
        bookId: bookId,
      })
      return {
        status: 200,
        message: 'Create new user book mark success',
        data: newBookMark,
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const follow = async (userId, bookId) => {
  try {
    if (!userId || !bookId) {
      return {
        status: 400,
        message: 'Missing required fields',
      }
    }

    let history = await History.findOne({ userId })
    if (!history) {
      history = await History.create({
        userId,
        books: [],
        lastReadBook: null,
        like: [],
        follow: [bookId],
        rating: [],
        comment: [],
      })
    } else {
      const existingBookIndex = history.books.findIndex(
        (book) => book.bookId.toString() === bookId.toString()
      )
      if (existingBookIndex > -1) {
        history.books[existingBookIndex].lastReadAt = new Date()
      } else {
        history.follow.push(bookId)
      }
    }

    await history.save()

    let followList = await FollowList.findOne({ userId })

    if (!followList) {
      const newFollowList = await FollowList.create({
        userId,
        books: [bookId],
      })
      if (newFollowList) {
        return {
          status: 200,
          message: 'Follow book success',
        }
      }
    } else {
      if (!followList.books.includes(bookId)) {
        followList.books.push(bookId)
        await followList.save()
      } else {
        return {
          status: 400,
          message: 'Book already followed',
        }
      }

      return {
        status: 200,
        message: 'Follow book success',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getFollowList = async (userId, pageIndex, pageSize) => {
  try {
    const followList = await FollowList.findOne({ userId: userId }).populate({
      path: 'books',
      populate: [
        { path: 'authorId' },
        { path: 'categoryId' },
        { path: 'majorId' },
        { path: 'review' },
      ],
    })

    if (!followList) {
      return {
        status: 400,
        message: 'Follow list not found',
      }
    }

    const data = followList.books.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    )

    return {
      status: 200,
      message: 'Get follow list success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getNotification = async (userId) => {
  try {
    const notification = await Notify.find({
      userId: userId,
    })
      .populate({
        path: 'bookId',
        populate: {
          path: 'authorId',
        },
      })
      .sort({ createdAt: -1 })
      .limit(10)

    if (notification) {
      return {
        status: 200,
        message: 'Get notification success',
        data: notification,
      }
    } else {
      return {
        status: 400,
        message: 'Notification not found',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const updateNotificationStatus = async (userId, notifyId) => {
  try {
    let notification = await Notify.findOne({
      userId: userId,
      _id: notifyId,
    })
    if (notification) {
      notification.status = 'READ'
      const result = await notification.save()
      if (result) {
        return {
          status: 200,
          message: 'Update notification status success',
        }
      }
    } else {
      return {
        status: 400,
        message: 'Notification not found',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getHotSearch = async () => {
  try {
    const trendingKeywords = await HotSearch.find()
      .sort({ searchCount: -1 })
      .limit(25)
    return {
      status: 200,
      message: 'Get trending keywords success',
      data: trendingKeywords,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const checkFollowBook = async (userId, bookId) => {
  try {
    const followList = await FollowList.findOne({
      userId: userId,
    })
    if (followList && followList.books.includes(bookId)) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}
const unFollow = async (userId, bookId) => {
  try {
    let followList = await FollowList.findOne({ userId: userId })
    if (!followList) {
      return {
        status: 400,
        message: 'User has not followed any book yet',
      }
    }
    if (!followList.books.includes(bookId)) {
      return {
        status: 404,
        message: 'Book not found in follow list',
      }
    }

    followList.books = followList.books.filter(
      (book) => book.toString() !== bookId
    )
    const result = await followList.save()
    if (result) {
      return {
        status: 200,
        message: 'Unfollow book success',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const commentInChapter = async (userId, chapterId, comment) => {
  try {
    if (!userId || !chapterId || !comment) {
      return {
        errCode: 409,
        message: 'Missing required fields',
      }
    }
    const newComment = await ChapterComment.create({
      chapterId: chapterId,
      user: userId,
      content: comment,
      postDate: new Date(),
    })

    const chapter = await Chapter.findOne({
      _id: chapterId,
    })
    chapter.comments.push(newComment._id)
    await chapter.save()

    return {
      errCode: 200,
      message: 'Create comment in chapter success',
      data: newComment,
    }
  } catch (error) {
    throw new Error(error)
  }
}
const updateHistory = async (userId, bookId, chapterId) => {
  try {
    const history = await History.findOne({
      userId: userId,
    })
    if (!history) {
      const newHistory = await History.create({
        userId: userId,
        books: [
          {
            bookId: bookId,
            lastReadChapterId: chapterId,
            lastReadAt: new Date(),
          },
        ],
        lastReadBook: bookId,
      })
      return {
        status: 200,
        message: 'Create history success',
        data: newHistory,
      }
    } else {
      const book = history.books.find((book) => book.bookId === bookId)
      if (!book) {
        history.books.push({
          bookId: bookId,
          lastReadChapterId: chapterId,
          lastReadAt: new Date(),
        })
      } else {
        book.lastReadChapterId = chapterId
        book.lastReadAt = new Date()
      }
      history.lastReadBook = bookId
      await history.save()
      return {
        status: 200,
        message: 'Update history success',
        data: history,
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getUserHistory = async (userId) => {
  try {
    const history = await History.findOne({
      userId: userId,
    })
    if (!history) {
      return {
        status: 404,
        message: 'History not found',
      }
    }

    return {
      status: 200,
      message: 'Get history success',
      data: history,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const requestAmount = async (userId, amount, description, bankConfigId) => {
  try {
    const request = await RequestAmount.create({
      userId: userId,
      amount: amount,
      description: description,
      bankConfigId: bankConfigId,
      date: new Date(),
      status: 'PENDING',
    })
    return {
      status: 200,
      message: 'Request amount success',
      data: request,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const buyBook = async (userId, bookId) => {
  try {
    const book = await Book.findById(bookId)
    let userAmount = await Amount.findOne({ userId: userId })
    let userBookMark = await BookMark.findOne({
      userId: userId,
      bookId: bookId,
    })
    if (userBookMark.isBuy) {
      return {
        status: 400,
        message: 'Book already bought',
      }
    }
    if (!userBookMark) {
      userBookMark = new BookMark({
        userId: userId,
        bookId: bookId,
        like: false,
        follow: false,
        rating: 0,
        notes: '',
        highLights: [],
      })
    }
    if (!userAmount) {
      return {
        status: 404,
        message: 'User amount not found - Please recharge your account',
      }
    }
    if (userAmount.total < book.price) {
      return {
        status: 400,
        message: 'Not enough money in your account',
      }
    }
    userBookMark.isBuy = true
    await userBookMark.save()

    userAmount.total -= book.price
    userAmount.history.push({
      amount: -Math.abs(book.price),
      description: `${bookId}`,
      remain: userAmount.total,
      date: new Date(),
    })
    await userAmount.save()
    return {
      status: 200,
      message: 'Buy book success',
      data: {
        userAmount,
        userBookMark,
      },
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getUserAmount = async (userId, startDate, endDate) => {
  try {
    const userAmount = await Amount.findOne({ userId: userId })
    if (!userAmount) {
      return {
        status: 404,
        message: 'User amount not found',
      }
    }

    // Xác định ngày đầu và cuối của tháng nếu startDate và endDate là null
    const now = new Date()
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1) // Ngày đầu tháng
    const end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0) // Ngày cuối tháng

    // Lọc lịch sử theo khoảng ngày
    const filteredHistory = userAmount.history.filter((item) => {
      const itemDate = new Date(item.date) // Chuyển đổi item.date thành Date
      return itemDate >= start && itemDate <= end
    })

    // Sắp xếp lại lịch sử đã lọc từ mới đến cũ
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Thêm chi tiết sách nếu có
    for (let item of filteredHistory) {
      if (item.amount < 0 && item.description) {
        const book = await Book.findById(item.description)
        if (book) {
          item.detail = book
        }
      }
    }

    return {
      status: 200,
      message: 'Get user amount success',
      data: {
        ...userAmount.toObject(),
        history: filteredHistory, // Thay thế mảng history bằng mảng đã lọc
      },
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}

const getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId).populate(['amount', 'historyId'])
    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      }
    }
    return {
      status: 200,
      message: 'Get user info success',
      data: user,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getPendingRequest = async (userId) => {
  try {
    const requests = await RequestAmount.find({
      userId: userId,
      status: 'PENDING',
    }).populate('bankConfigId')
    return {
      status: 200,
      message: 'Get pending request success',
      data: requests,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const cancelPendingRequest = async (userId, requestId) => {
  try {
    const result = await RequestAmount.deleteOne({
      userId: userId,
      _id: requestId,
      status: 'PENDING',
    })

    if (result.deletedCount === 0) {
      return {
        status: 404,
        message: 'No request found to delete',
      }
    }

    return {
      status: 200,
      message: 'Cancel request success',
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getBoughtBook = async (userId) => {
  try {
    const books = await BookMark.find({
      userId: userId,
      isBuy: true,
    }).populate('bookId')
    return {
      status: 200,
      message: 'Get bought book success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getUserReadHistory = async (userId) => {
  try {
    const history = await History.findOne({ userId })
    if (!history) {
      return {
        status: 404,
        message: 'History not found',
      }
    }

    let uniqueBooks = history.books
      .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))
      .filter(
        (book, index, self) =>
          index === self.findIndex((b) => b.bookId === book.bookId)
      )

    const readHistory = await Promise.all(
      uniqueBooks.map(async (book) => {
        const detail = await Book.findById(book.bookId)
          .populate('authorId', '_id name')
          .populate('categoryId', '_id name')
          .populate('majorId', '_id name')
          .lean()
        return {
          bookId: book.bookId,
          lastReadChapterId: book.lastReadChapterId,
          lastReadAt: book.lastReadAt,
          detail,
        }
      })
    )

    return {
      status: 200,
      message: 'Read history retrieved successfully',
      data: readHistory,
    }
  } catch (error) {
    console.error('Error in getUserReadHistory:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}

module.exports = {
  like,
  read,
  rate,
  comment,
  createUserBookMark,
  updateUserBookMark,
  getUserBookMark,
  follow,
  getFollowList,
  getNotification,
  updateNotificationStatus,
  getHotSearch,
  checkFollowBook,
  unFollow,
  commentInChapter,
  updateHistory,
  getUserHistory,
  requestAmount,
  buyBook,
  getUserAmount,
  getUserInfo,
  getPendingRequest,
  cancelPendingRequest,
  getBoughtBook,
  getUserReadHistory,
}
