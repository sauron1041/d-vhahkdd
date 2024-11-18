import mongoose from 'mongoose'
import imageService from '../services/image.service.js'

const upload = async (req, res) => {
  try {
    const { files } = req.files
    if (!files) {
      res.status(400).send('Please upload a file')
      return
    }
    const response = await imageService.upload(files)
    if (!response) {
      res.status(500).send('Upload failed')
      return
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = {
  upload,
}
