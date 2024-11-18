import recommendService from '../services/recommendAI.service'
const recommendBook = async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) {
      return res.status(400).json({
        errCode: 1,
        message: 'User id is required',
      })
    }
    const recommendedBooks = await recommendService.suggestBooks(userId)
    return res.status(200).json({
      errCode: 0,
      message: 'Success',
      data: recommendedBooks,
    })
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: 'Internal server error',
    })
  }
}
module.exports = {
  recommendBook,
}
