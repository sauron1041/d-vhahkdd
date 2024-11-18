import { v2 as cloudinary } from 'cloudinary'
;(async function () {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  })

  // const uploadResult = await cloudinary.uploader
  //   .upload(
  //     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
  //     {
  //       public_id: 'shoes',
  //     }
  //   )
  //   .catch((error) => {
  //     console.log(error)
  //   })

  // console.log(uploadResult)

  // const optimizeUrl = cloudinary.url('shoes', {
  //   fetch_format: 'auto',
  //   quality: 'auto',
  // })

  // console.log(optimizeUrl)

  // const autoCropUrl = cloudinary.url('shoes', {
  //   crop: 'auto',
  //   gravity: 'auto',
  //   width: 500,
  //   height: 500,
  // })

  // console.log(autoCropUrl)
  // Hàm tải lên hình ảnh
  const uploadImage = async (imagePath, publicId) => {
    try {
      const uploadResult = await cloudinary.uploader.upload(imagePath, {
        public_id: publicId,
      })
      console.log('Upload Successful:', uploadResult)
      return uploadResult
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }

  // Hàm lấy URL hình ảnh với tối ưu hóa
  const getOptimizedImageUrl = (publicId) => {
    try {
      const url = cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
      })
      console.log('Optimized Image URL:', url)
      return url
    } catch (error) {
      console.error('URL Generation Error:', error)
      throw error
    }
  }
})()

export default cloudinary
