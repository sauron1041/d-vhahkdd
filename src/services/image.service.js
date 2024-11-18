import cloudinary from '../config/cloudinary'

const upload = async (files) => {
  try {
    const images = files.map((file) => file.path)
    const uploadedImages = []
    for (const image of images) {
      const uploadResult = await cloudinary.uploader.upload(image)
      uploadedImages.push(uploadResult)
    }
    return uploadedImages
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  upload,
}
