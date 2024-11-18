import cloudinary from '../config/cloudinary'
import Book from '../config/nosql/models/book.model'
import Content from '../config/nosql/models/content.model'
import Chapter from '../config/nosql/models/chapter.model'
import Author from '../config/nosql/models/author.model'
import Category from '../config/nosql/models/category.model'
import Major from '../config/nosql/models/major.model'
import BookMark from '../config/nosql/models/book-mark.model'
import Review from '../config/nosql/models/review.model'
import Notify from '../config/nosql/models/notify.model'
import FollowList from '../config/nosql/models/follow-list.model'
import HotSearch from '../config/nosql/models/hot-search.model'
import fs from 'fs'
import path from 'path'
import { componentsToColor, PDFDocument } from 'pdf-lib'
import pdfParse from 'pdf-parse'
import pdfPoppler from 'pdf-poppler'
import Tesseract from 'tesseract.js'

const create = async (book) => {
  try {
    // Kiểm tra authorId, categoryId, và majorId
    if (book.authorId) {
      const author = await Author.findById(book.authorId)
      if (!author) {
        return {
          status: 404,
          message: 'Author not found',
        }
      }
    }
    if (book.categoryId) {
      const category = await Category.findById(book.categoryId)
      if (!category) {
        return {
          status: 404,
          message: 'Category not found',
        }
      }
    }
    if (book.majorId) {
      const major = await Major.findById(book.majorId)
      if (!major) {
        return {
          status: 404,
          message: 'Major not found',
        }
      }
    }

    // Upload ảnh lên Cloudinary và xử lý đường dẫn ảnh
    const localImagePath = path.join('uploads/', path.basename(book.image))
    const imagePath = await cloudinary.uploader.upload(book.image, {
      public_id: book.title,
    })

    // Tạo đối tượng sách (không lưu vào DB ngay)
    const bookData = new Book({
      ...book,
      image: imagePath.secure_url,
      price: book.price ? book.price : 0,
      status: book.status ? book.status : 'ISWRITE',
      createDate: new Date(),
    })

    // Tạo đối tượng content và lưu content trước
    const content = new Content({
      bookId: bookData._id,
      numberOfChapter: 0,
      chapters: [],
    })
    const contentData = await Content.create(content)

    // Gán contentId vào sách trước khi lưu
    bookData.content = contentData._id
    const data = await bookData.save()

    // Tạo review và lưu
    const review = new Review({
      bookId: data._id,
      totalLike: 0,
      totalView: 0,
      comments: [],
      rate: 0,
      rating: [],
    })
    const reviewResponse = await Review.create(review)
    data.review = reviewResponse._id
    await data.save()

    // Xóa ảnh tạm
    fs.unlinkSync(localImagePath)

    return {
      status: 200,
      message: 'Create book success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const update = async (book) => {
  try {
    const data = await Book.update(book)
    return {
      status: 200,
      message: 'Update book success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const remove = async (id) => {
  try {
    const book = await Book.findOne(id)
    if (!book) {
      return {
        status: 404,
        message: 'Book not found',
      }
    }
    book.active = false
    const data = await Book.update(book)
    return {
      status: 200,
      message: 'Delete book success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const uploadToCloudinary = async (filePath, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result.secure_url)
        }
      }
    )
  })
}
const addChapter = async (chapter) => {
  try {
    const content = await Content.findById(chapter.contentId)

    if (!chapter.title) {
      chapter.title = `Chapter ${
        (content.numberOfChapter ? content.numberOfChapter : 0) + 1
      }`
    }

    const pdfFilePath = path.join('uploads', path.basename(chapter.file.path))
    const pdfData = fs.readFileSync(pdfFilePath)

    await checkPdfContent(pdfFilePath, chapter.contentId)

    // Kiểm tra xem PDF có phải dạng văn bản không
    let pdfText = ''
    try {
      const parsedData = await pdfParse(pdfData)
      pdfText = parsedData.text
    } catch (error) {
      console.error('Lỗi trích xuất văn bản từ PDF:', error.message)
    }

    let textPages = []
    const imagePaths = [] // Mảng chứa URL ảnh tải lên Cloudinary

    if (pdfText && pdfText.trim() !== '') {
      // Nếu PDF có văn bản, phân trang theo đoạn văn bằng dấu ngắt dòng "\n\n"
      textPages = pdfText.split('\n\n')
    } else {
      // Nếu PDF không có văn bản, thực hiện OCR từ ảnh trên từng trang
      const options = {
        format: 'png',
        out_dir: path.dirname(pdfFilePath),
        out_prefix: path.basename(pdfFilePath, path.extname(pdfFilePath)),
      }
      await pdfPoppler.convert(pdfFilePath, options)

      // Đọc danh sách các file ảnh đã tạo từ PDF
      const imageFiles = fs
        .readdirSync(path.dirname(pdfFilePath))
        .filter(
          (file) => file.startsWith(options.out_prefix) && file.endsWith('.png')
        )

      for (const imageFile of imageFiles) {
        const imageFilePath = path.join(path.dirname(pdfFilePath), imageFile)

        // Sử dụng Tesseract để thực hiện OCR trên ảnh của từng trang
        const ocrResult = await Tesseract.recognize(imageFilePath, 'vie')
        textPages.push(ocrResult.data.text) // Lưu văn bản trích xuất được

        // Xóa ảnh sau khi OCR và tải lên Cloudinary
        fs.unlinkSync(imageFilePath)
      }
    }

    // Tạo ảnh từ PDF và tải lên Cloudinary dù có văn bản hay không
    const options = {
      format: 'png',
      out_dir: path.dirname(pdfFilePath),
      out_prefix: path.basename(pdfFilePath, path.extname(pdfFilePath)),
    }
    await pdfPoppler.convert(pdfFilePath, options)

    const imageFiles = fs
      .readdirSync(path.dirname(pdfFilePath))
      .filter(
        (file) => file.startsWith(options.out_prefix) && file.endsWith('.png')
      )

    for (const imageFile of imageFiles) {
      const imageFilePath = path.join(path.dirname(pdfFilePath), imageFile)
      const imageUrl = await uploadToCloudinary(imageFilePath)
      imagePaths.push(imageUrl)

      fs.unlinkSync(imageFilePath)
    }

    // Xóa file PDF gốc
    fs.unlinkSync(pdfFilePath)

    // Lưu chương mới với dữ liệu đã trích xuất
    const newChapter = new Chapter({
      bookId: content.bookId,
      contentId: chapter.contentId,
      title: chapter.title,
      text: textPages,
      images: imagePaths, // Lưu các URL ảnh đã upload lên Cloudinary
      mp3s: [],
      numberOfPage: textPages.length,
      status: 'ACTIVE',
    })

    const chapterData = await Chapter.create(newChapter)

    content.numberOfChapter += 1
    const result = await content.save()

    await sendAddedChapterNotification(chapterData, content.bookId)

    if (chapter.status) {
      const book = await Book.findOne({ _id: content.bookId })
      book.status = chapter.status
      await book.save()
    }

    if (!result) {
      return {
        status: 500,
        message: 'Lỗi cập nhật nội dung',
      }
    }

    return {
      status: 200,
      message: 'Thêm chương thành công',
      data: chapterData,
    }
  } catch (error) {
    console.error('Lỗi xử lý chương:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}
const addMultipleChapters = async (
  contentId,
  file,
  chapterTitles,
  chapterPaginations,
  status
) => {
  try {
    // Đọc file PDF lớn
    const pdfFilePath = path.join('uploads', path.basename(file.path))
    console.log(`Reading PDF file from path: ${pdfFilePath}`)
    const pdfData = fs.readFileSync(pdfFilePath)

    // Tải tài liệu PDF
    const pdfDoc = await PDFDocument.load(pdfData)

    for (let i = 0; i < chapterPaginations.length; i++) {
      const pages = chapterPaginations[i] // Mảng chứa các trang của chương
      const chapterTitle = chapterTitles[i] || `Chapter ${i + 1}`

      // Tạo một tài liệu PDF mới cho từng chương
      const chapterDoc = await PDFDocument.create()

      // Sao chép các trang từ pdfDoc sang chapterDoc
      const copiedPages = await chapterDoc.copyPages(
        pdfDoc,
        pages.map((p) => p - 1)
      )

      // Thêm từng trang đã sao chép vào chapterDoc
      copiedPages.forEach((page) => {
        chapterDoc.addPage(page)
      })

      // Lưu file PDF cho từng chương tạm thời
      const chapterPdfPath = path.join('uploads', `chapter_${i + 1}.pdf`)
      const chapterPdfBytes = await chapterDoc.save()
      fs.writeFileSync(chapterPdfPath, chapterPdfBytes)

      // Gọi lại API addChapter cho chương đã tách ra
      await addChapter({
        contentId,
        title: chapterTitle,
        file: { path: chapterPdfPath },
      })
    }

    // Xóa file PDF gốc
    fs.unlinkSync(pdfFilePath)

    if (status) {
      const content = await Content.findById(contentId)
      const book = await Book.findById(content.bookId)
      book.status = 'FINISH'
      await book.save()
    }

    return {
      status: 200,
      message: 'All chapters added successfully',
    }
  } catch (error) {
    console.error('Error splitting PDF and adding chapters:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}

const addMultiChapterByOutline = async (contentId, file) => {
  try {
    // Đọc file PDF
    const pdfFilePath = path.join('uploads', path.basename(file.path))
    const pdfData = fs.readFileSync(pdfFilePath)

    // Trích xuất nội dung văn bản từ file PDF
    const data = await pdfParse(pdfData)
    const text = data.text
    const totalPages = data.numpages // Tổng số trang của PDF

    // Tìm từ khóa "MỤC LỤC" và lấy các dòng bên dưới
    const lines = text.split('\n')
    const tocStartIndex = lines.findIndex((line) => line.includes('MỤC LỤC'))
    if (tocStartIndex === -1) {
      return { status: 400, message: 'Không tìm thấy MỤC LỤC trong tài liệu' }
    }

    const tableOfContents = []
    for (let i = tocStartIndex + 1; i < lines.length; i++) {
      let line = lines[i].trim()
      if (!line) continue

      // Kiểm tra nếu dòng hiện tại không có số trang
      const match = line.match(/^(.+?)\s+(\d+)$/)
      if (!match) {
        const nextLine = lines[i + 1] ? lines[i + 1].trim() : ''
        if (nextLine && /^\d+$/.test(nextLine)) {
          line = `${line} ${nextLine}`
          i++
        } else {
          break
        }
      }

      const finalMatch = line.match(/^(.+?)\s+(\d+)$/)
      if (finalMatch) {
        // Lấy tiêu đề chương và loại bỏ các dấu "..."
        const title = finalMatch[1].trim().replace(/\.+$/, '').trim() // Bỏ các dấu chấm ở cuối
        const startPage = parseInt(finalMatch[2], 10)
        tableOfContents.push({ title, startPage })
      }
    }
    if (!tableOfContents.length) {
      return {
        status: 400,
        message: 'Something wrong with outline!',
      }
    }

    // Tạo các chương từ MỤC LỤC
    for (let i = 0; i < tableOfContents.length; i++) {
      const { title, startPage } = tableOfContents[i]
      const endPage =
        i < tableOfContents.length - 1
          ? tableOfContents[i + 1].startPage - 1
          : totalPages // Nếu là chương cuối, đặt trang cuối là tổng số trang

      const pdfDoc = await PDFDocument.load(pdfData)
      const chapterDoc = await PDFDocument.create()

      const copiedPages = await chapterDoc.copyPages(
        pdfDoc,
        Array.from(
          { length: endPage - startPage + 1 },
          (_, idx) => startPage + idx - 1
        )
      )
      copiedPages.forEach((page) => chapterDoc.addPage(page))

      const chapterPdfPath = path.join('uploads', `chapter_${i + 1}.pdf`)
      const chapterPdfBytes = await chapterDoc.save()
      fs.writeFileSync(chapterPdfPath, chapterPdfBytes)

      await addChapter({
        contentId,
        title,
        file: { path: chapterPdfPath },
      })
    }

    fs.unlinkSync(pdfFilePath)

    const content = await Content.findById(contentId)
    const book = await Book.findById(content.bookId)
    book.status = 'FINISH'
    await book.save()

    return {
      status: 200,
      message: 'All chapters added successfully based on table of contents',
    }
  } catch (error) {
    console.error('Lỗi khi phân tách PDF theo MỤC LỤC:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getBookById = async (id) => {
  try {
    const data = await Book.findById(id)
      .populate('content')
      .populate('authorId')
      .populate('categoryId')
      .populate('majorId')

    return {
      status: 200,
      message: 'Get book by id success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const search = async (params) => {
  try {
    const query = {}

    if (params.title) {
      query.title = { $regex: params.title, $options: 'i' }
    }

    if (params.categoryId) {
      query.categoryId = params.categoryId
    }

    if (params.authorId) {
      query.authorId = params.authorId
    }
    query.active = true

    const books = await Book.find(query)
      .populate([{ path: 'authorId' }, { path: 'categoryId' }])
      .skip(params.pageIndex * params.pageSize)
      .limit(params.pageSize)

    const totalBooks = await Book.countDocuments(query)

    return {
      status: 200,
      message: 'Search book success',
      data: {
        total: totalBooks,
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        data: books,
      },
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getDetailBookById = async (id) => {
  try {
    const data = await Book.findById(id)
      .populate({
        path: 'content',
      })
      .populate('authorId')
      .populate('categoryId')
      .populate('majorId')
      .populate({
        path: 'review',
        populate: {
          path: 'comments',
          populate: {
            path: 'user',
          },
        },
      })

    const chapters = await Chapter.find({
      contentId: data.content._id,
    })
    data.content.chapters = chapters

    return {
      status: 200,
      message: 'Get detail book by id success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getBookType = async (contentId) => {
  try {
    const content = await Content.findById(contentId)
    const book = await Book.findById(content.bookId)
    if (!book) {
      return null
    }
    return book.type
  } catch (error) {
    return null
  }
}
const createUserBookMark = async (userId, bookId) => {
  try {
    const bookMark = await BookMark.findOne({
      userId: userId,
    })
    if (bookMark) {
      if (bookMark.books.includes(bookId)) {
        return {
          status: 400,
          message: 'Book already bookmarked',
        }
      }
      bookMark.books.push(bookId)
      const data = await bookMark.save()
      return {
        status: 200,
        message: 'Create user book mark success',
        data: data,
      }
    } else {
      const newBookMark = new BookMark({
        userId: userId,
        books: [bookId],
      })
      const data = await BookMark.create(newBookMark)
      return {
        status: 200,
        message: 'Create user book mark success',
        data: data,
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const updateUserBookMark = async (userId, bookId) => {
  try {
    const bookMark = await BookMark.findOne({
      userId: userId,
    })
    if (bookMark) {
      if (bookMark.books.includes(bookId)) {
        bookMark.books = bookMark.books.filter((id) => id !== bookId)
        const data = await bookMark.save()
        return {
          status: 200,
          message: 'Update user book mark success',
          data: data,
        }
      } else {
        return {
          status: 400,
          message: 'Book not bookmarked',
        }
      }
    } else {
      return {
        status: 400,
        message: 'User book mark not found',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getUserBookMark = async (userId) => {
  try {
    const bookMark = await BookMark.findOne({
      userId: userId,
    })
    if (bookMark) {
      return {
        status: 200,
        message: 'Get user book mark success',
        data: bookMark,
      }
    } else {
      return {
        status: 400,
        message: 'User book mark not found',
      }
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getTopViewedBooks = async () => {
  try {
    const topReviews = await Review.find()
      .sort({ totalView: -1 })
      .limit(10)
      .select('_id bookId')

    const bookIds = topReviews.map((review) => review.bookId)

    const books = await Book.find({ _id: { $in: bookIds } })
      .populate('content')
      .populate('authorId')
      .populate('categoryId')
      .populate('majorId')
      .populate('review')

    return {
      status: 200,
      message: 'Get top viewed books success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getDetailChapterById = async (id) => {
  try {
    const data = await Chapter.findById(id)
      .populate({
        path: 'comments',
        populate: 'user',
      })
      .lean()
    const allChapters = await Chapter.find({
      contentId: data.contentId,
    })
    data.allChapters = allChapters
    return {
      status: 200,
      message: 'Get detail chapter by id success',
      data: data,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getRelatedBooks = async (id) => {
  try {
    const book = await Book.findById(id)
    if (!book) {
      return {
        status: 404,
        message: 'Book not found',
      }
    }

    const books = await Book.find({
      $or: [{ categoryId: book.categoryId }, { authorId: book.authorId }],
      _id: { $ne: book._id },
      active: true,
    })
      .populate([
        { path: 'authorId' },
        { path: 'categoryId' },
        { path: 'majorId' },
        { path: 'review' },
      ])
      .limit(10)
      .lean()

    return {
      status: 200,
      message: 'Get related books success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const findBooksByTextInput = async (text) => {
  try {
    const books = await Book.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'authorId',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryId',
        },
      },
      {
        $lookup: {
          from: 'majors',
          localField: 'majorId',
          foreignField: '_id',
          as: 'majorId',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'bookId',
          as: 'review',
        },
      },
      {
        $match: {
          active: true,
          $or: [
            { title: { $regex: text, $options: 'i' } },
            { 'author.name': { $regex: text, $options: 'i' } },
            { 'category.name': { $regex: text, $options: 'i' } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          authorId: 1,
          categoryId: 1,
          majorId: 1,
          review: 1,
          image: 1,
          type: 1,
          createDate: 1,
          price: 1,
        },
      },
    ])
      .limit(10)
      .exec()

    const hotSearch = await HotSearch.findOne({ keyword: text })
    if (hotSearch) {
      hotSearch.searchCount += 1
      const trendingKeywords = await HotSearch.find()
        .sort({ searchCount: -1 })
        .limit(10)
      if (trendingKeywords.includes(hotSearch)) {
        hotSearch.isTrending = true
      }
      await hotSearch.save()
    } else {
      const newHotSearch = new HotSearch({
        keyword: text,
        searchCount: 1,
      })
      await HotSearch.create(newHotSearch)
    }

    return {
      status: 200,
      message: 'Find books by text input success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const sendAddedChapterNotification = async (chapter, bookId) => {
  try {
    const listFollowers = await FollowList.find({
      books: { $in: [bookId] },
    }).select('userId')

    const book = await Book.findById(bookId)
    if (!book) {
      return {
        status: 404,
        message: 'Book not found',
      }
    }

    if (listFollowers) {
      listFollowers.forEach(async (follower) => {
        const notify = new Notify({
          userId: follower.userId,
          bookId: bookId,
          chapterId: chapter._id,
          message: `${book.title} đã có chương mới: ${chapter.title}`,
          status: 'UNREAD',
          createDate: new Date(),
        })
        await Notify.create(notify)
      })
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getBookByCategory = async (categoryId) => {
  try {
    const books = await Book.find({ categoryId: categoryId, active: true })
      .populate('content')
      .populate('authorId')
      .populate('categoryId')
      .populate('majorId')
      .populate('review')
    return {
      status: 200,
      message: 'Get book by category success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const getNewBooks = async () => {
  try {
    const books = await Book.find({ active: true })
      .populate('content')
      .populate('authorId')
      .populate('categoryId')
      .populate('majorId')
      .populate('review')
      .sort({ createdAt: -1 })
      .limit(10)

    return {
      status: 200,
      message: 'Get new books success',
      data: books,
    }
  } catch (error) {
    return {
      status: 500,
      message: error.message,
    }
  }
}
const hasImageInBlocks = (blocks) => {
  for (const block of blocks) {
    // Kiểm tra xem block có phải loại "image" không
    if (block.blocktype === 'image') {
      return true
    }

    const text = block.text || ''
    const lines = text.split('\n')

    // Biến đếm số dòng ngắn/lạ liên tục
    let consecutiveShortLines = 0

    for (const line of lines) {
      // Kiểm tra độ dài của dòng và tỷ lệ ký tự lạ
      const nonAlphaNumCount = line.replace(/[a-zA-Z0-9\s]/g, '').length
      const totalLength = line.length
      const nonAlphaNumRatio =
        totalLength > 0 ? nonAlphaNumCount / totalLength : 1

      // Xác định dòng là "ngắn/lạ" nếu có tỷ lệ ký tự lạ cao hoặc độ dài ngắn
      const isShortOrUnusual = totalLength <= 5 && nonAlphaNumRatio > 0.3

      if (isShortOrUnusual && line !== '') {
        consecutiveShortLines++

        // Nếu có 3 dòng ngắn/lạ liên tiếp, coi block này như một ảnh
        if (consecutiveShortLines >= 4) {
          return true
        }
      } else {
        // Nếu gặp dòng bình thường, đặt lại bộ đếm
        consecutiveShortLines = 0
      }
    }
  }

  // Nếu không phát hiện ảnh
  return false
}
const checkPdfContent = async (filePath, contentId) => {
  try {
    // Kiểm tra tồn tại của tệp PDF
    if (!fs.existsSync(filePath)) {
      throw new Error('Tệp PDF không tồn tại.')
    }

    // Tạo thư mục tạm thời để lưu hình ảnh
    const outputDir = path.join(__dirname, 'output')
    if (fs.existsSync(outputDir)) {
      fs.readdirSync(outputDir).forEach((file) =>
        fs.unlinkSync(path.join(outputDir, file))
      )
    } else {
      // Tạo thư mục nếu chưa tồn tại
      fs.mkdirSync(outputDir)
    }

    const pdfData = fs.readFileSync(filePath)
    let pdfText = ''
    try {
      const parsedData = await pdfParse(pdfData)
      pdfText = parsedData.text
    } catch (error) {
      console.error('Lỗi trích xuất văn bản từ PDF:', error.message)
    }

    let hasTextOnly = true // Giả định ban đầu là chỉ có văn bản
    let hasImages = false

    if (pdfText && pdfText.trim() !== '') {
      // Cấu hình cho poppler
      const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(filePath, path.extname(filePath)),
        page: null,
      }

      // Chạy poppler để trích xuất hình ảnh
      await pdfPoppler.convert(filePath, options)

      // Danh sách các file ảnh đã tạo từ PDF
      const imageFiles = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.png'))

      for (const imageFile of imageFiles) {
        const imageFilePath = path.join(outputDir, imageFile)

        // Sử dụng Tesseract để OCR
        const ocrResult = await Tesseract.recognize(imageFilePath, 'vie')
        const blocks = ocrResult.data.blocks

        // Duyệt qua từng block để kiểm tra
        if (hasImageInBlocks(blocks)) {
          hasImages = true
          hasTextOnly = false
          break // Dừng vòng lặp nếu đã phát hiện ảnh
        }

        // Xóa file ảnh sau khi kiểm tra
        fs.unlinkSync(imageFilePath)
      }
    } else {
      // Cấu hình cho poppler
      const options = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: path.basename(filePath, path.extname(filePath)),
        page: null,
      }

      // Chạy poppler để trích xuất hình ảnh
      await pdfPoppler.convert(filePath, options)

      // Danh sách các file ảnh đã tạo từ PDF
      const imageFiles = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.png'))

      for (const imageFile of imageFiles) {
        const imageFilePath = path.join(outputDir, imageFile)

        // Sử dụng Tesseract để OCR
        const ocrResult = await Tesseract.recognize(imageFilePath, 'vie')
        const blocks = ocrResult.data.blocks

        // Duyệt qua từng block để kiểm tra
        if (hasImageInBlocks(blocks)) {
          hasImages = true
          hasTextOnly = false
          break // Dừng vòng lặp nếu đã phát hiện ảnh
        }

        // Xóa file ảnh sau khi kiểm tra
        fs.unlinkSync(imageFilePath)
      }
    }

    const content = await Content.findOne({ _id: contentId })
    if (!content) {
      throw new Error('Content ID không tồn tại!')
    }

    const book = await Book.findOne({ _id: content.bookId })
    if (!book) {
      throw new Error('Book ID không tồn tại!')
    }

    // Cập nhật type của sách dựa vào nội dung PDF

    if (hasImages) {
      book.type = 'IMAGE'
    } else if (!hasImages && book.type !== 'IMAGE') {
      book.type = 'VOICE'
    }

    // Lưu cập nhật của sách
    await book.save()
  } catch (error) {
    console.error('Kiểm tra file PDF thất bại:', error.message)
    throw new Error(`Kiểm tra file PDF thất bại: ${error.message}`)
  }
}
const deleteChapter = async (chapterId) => {
  try {
    const deleteChapter = await Chapter.findOne({
      _id: chapterId,
    })
    if (!deleteChapter) {
      return {
        status: 500,
        message: 'Failed to find chapter!',
      }
    }

    const contentUpdateResult = await Content.findOneAndUpdate(
      { _id: deleteChapter.contentId },
      {
        $pull: { chapters: chapterId },
        $inc: { numberOfChapter: -1 },
      },
      { new: true }
    )

    if (!contentUpdateResult) {
      return {
        status: 500,
        message: 'Failed to update content number of chapters!',
      }
    }

    const chapter = await Chapter.findByIdAndDelete(chapterId)
    if (!chapter) {
      return {
        status: 404,
        message: 'Chapter not found!',
      }
    }

    return {
      status: 200,
      message: 'Delete chapter successfully!',
    }
  } catch (error) {
    console.error('Delete chapter fail:', error.message)
    return {
      status: 500,
      message: error.message,
    }
  }
}

module.exports = {
  create,
  update,
  remove,
  addChapter,
  getBookById,
  search,
  getDetailBookById,
  getBookType,
  createUserBookMark,
  updateUserBookMark,
  getUserBookMark,
  getTopViewedBooks,
  getDetailChapterById,
  getRelatedBooks,
  findBooksByTextInput,
  getBookByCategory,
  getNewBooks,
  addMultipleChapters,
  deleteChapter,
  addMultiChapterByOutline,
}
