import multer from 'multer'
import path from 'path'

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname))
    },
  }),
  onError: function (err, next) {
    console.log('error', err)
    next(err)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/
    const mimetype = allowedTypes.test(file.mimetype)
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'))
  },
})
export default upload
