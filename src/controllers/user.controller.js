import userService from '../services/user.service'

const like = async (req, res) => {
  try {
    const { userId, bookId } = req.body
    const data = await userService.like(userId, bookId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const read = async (req, res) => {
  try {
    const { userId, bookId, chapterId } = req.body
    if (!bookId || !userId || !chapterId) {
      return res.status(400).send('Missing params: userID, bookID or chapterID')
    }
    const data = await userService.read(userId, bookId, chapterId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const rate = async (req, res) => {
  try {
    const { userId, bookId, rating } = req.body
    if (!userId || !bookId || !rating) {
      return res.status(400).send('User id, book id and rating are required')
    }
    const data = await userService.rate(userId, bookId, rating)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const comment = async (req, res) => {
  try {
    const { userId, bookId, comment } = req.body
    const data = await userService.comment(userId, bookId, comment)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const createUserBookMark = async (req, res) => {
  try {
    const { userId, bookId } = req.body
    if (!userId || !bookId) {
      return res.status(400).send('Missing params')
    }
    const data = await userService.createUserBookMark(userId, bookId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const updateUserBookMark = async (req, res) => {
  try {
    const { userId, bookId, chapterId } = req.body
    if (!userId || !bookId || !chapterId) {
      return res.status(400).send('Missing params!')
    }
    const data = await userService.updateUserBookMark({
      ...req.body,
    })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const getUserBookMark = async (req, res) => {
  try {
    const { userId, bookId } = req.query

    if (!userId || !bookId) {
      return res.status(400).send('Bad request: Missing userId or book ID')
    }
    const data = await userService.getUserBookMark(userId, bookId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const follow = async (req, res) => {
  try {
    const { userId, bookId } = req.body
    const data = await userService.follow(userId, bookId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
const getFollowList = async (req, res) => {
  try {
    const { userId, pageIndex, pageSize } = req.query
    if (!userId || !pageIndex || !pageSize) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getFollowList(userId, pageIndex, pageSize)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getNotification = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getNotification(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const updateNotificationStatus = async (req, res) => {
  try {
    const { userId, notifyId } = req.body
    if (!userId || !notifyId) {
      return res.status(400).send('User id and notify id are required')
    }
    const data = await userService.updateNotificationStatus(userId, notifyId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getHotSearch = async (req, res) => {
  try {
    const data = await userService.getHotSearch()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const checkFollowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.query
    if (!userId || !bookId) {
      return res.status(400).send('User id and book id are required')
    }
    const data = await userService.checkFollowBook(userId, bookId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const unFollow = async (req, res) => {
  try {
    const { userId, bookId } = req.query
    const data = await userService.unFollow(userId, bookId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const commentInChapter = async (req, res) => {
  try {
    const { userId, chapterId, comment } = req.body
    if (!userId || !chapterId || !comment) {
      return res
        .status(400)
        .send('User id, chapter id and comment are required')
    }
    const data = await userService.commentInChapter(userId, chapterId, comment)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getUserHistory(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const requestAmount = async (req, res) => {
  try {
    const { userId, amount, description, bankConfigId } = req.body
    if (!userId || !amount || !bankConfigId) {
      return res.status(400).send('User id, bankId and amount are required')
    }
    const data = await userService.requestAmount(
      userId,
      amount,
      description,
      bankConfigId
    )
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const buyBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body
    if (!userId || !bookId) {
      return res.status(400).send('User id and book id are required')
    }
    const data = await userService.buyBook(userId, bookId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getUserAmount = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getUserAmount(userId, startDate, endDate)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getUserInfo(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getPendingRequest = async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getPendingRequest(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const cancelPendingRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.body
    if (!userId || !requestId) {
      return res.status(400).send('User id and request id are required')
    }
    const data = await userService.cancelPendingRequest(userId, requestId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getBoughtBook = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getBoughtBook(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
  }
}
const getUserReadHistory = async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).send('User id is required')
    }
    const data = await userService.getUserReadHistory(userId)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).send(error.message)
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
