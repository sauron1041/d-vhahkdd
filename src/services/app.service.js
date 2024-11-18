import db from '../config/nosql/models/user.model'
import customizeUser, { hashPassword } from '../ultils/customizeUser'
import handleJwt from '../ultils/handleJwt'
import { v4 as uuidv4 } from 'uuid'
const host = process.env.BACKEND_URL

import fs from 'fs'
import path from 'path'
import User from '../config/nosql/models/user.model'
import History from '../config/nosql/models/history.model'

const boxes_path = path.resolve('public/data', 'backgroundUser.json')
const rawdata = fs.readFileSync(boxes_path)
let data = JSON.parse(rawdata.toString())

const random = parseInt(Math.random() * data.length)

require('dotenv').config()
const secret = process.env.SECRET
const expiresIn = process.env.EXPIRESD_IN

const register = async ({ userName, studentCode, password: plainPassword }) => {
  try {
    // check user exists;
    let userExists = await User.findOne({
      where: {
        studentCode,
      },
    })
    if (userExists) {
      return {
        errCode: 4,
        message:
          'User with this student code already exists, please use another code',
      }
    }

    // Create new user;
    const avatar = process.env.NONE_AVATAR_USER
    let refresh_token = uuidv4()
    let password = hashPassword(plainPassword)

    const user = new User({
      userName,
      studentCode,
      password,
      refresh_token,
      avatar,
    })

    // Save the user first to get the user ID
    const savedUser = await user.save()

    // Create user history with the user ID
    const userHistory = new History({
      userId: savedUser.id,
      books: [],
      lastReadBook: null,
      like: [],
      follow: [],
      rating: [],
      comment: [],
    })

    // Save the user history
    const userHistorySave = await userHistory.save()

    // Update user with the history ID
    savedUser.historyId = userHistorySave._id

    // Save the user again to update the history ID
    await savedUser.save()

    // Customize the user before returning
    if (savedUser) {
      let userAfterCustomize = customizeUser.standardUser(savedUser)
      return {
        errCode: 0,
        message: 'Created',
        data: userAfterCustomize,
      }
    } else {
      return {
        errCode: 1,
        message: 'User creation failed',
      }
    }
  } catch (error) {
    throw error
  }
}

const verifyUser = async (studentCode) => {
  try {
    const userRaw = await User.findOne({
      studentCode: studentCode,
    }).populate('amount')
    if (Object.keys(userRaw).length !== 0) {
      delete userRaw.avatar
      let access_token = handleJwt.signJwt(userRaw, secret, expiresIn)
      let refresh_token = uuidv4()
      userRaw.refresh_token = refresh_token
      await userRaw.save()
      return {
        errCode: 0,
        message: 'Verify user success',
        data: {
          userRaw,
          access_token: access_token,
          refresh_token: refresh_token,
        },
      }
    }
    return {
      errCode: 1,
      message: 'Verify fail, Please check your code !',
    }
  } catch (error) {
    throw error
  }
}

const login = async (studentCode, password, email, loginWithManagerRole) => {
  try {
    let user = null
    if (loginWithManagerRole) {
      user = await User.findOne({
        email: email,
      })
    } else {
      user = await User.findOne({
        studentCode: studentCode,
      })
    }

    if (!user) {
      return {
        errCode: 1,
        message: 'Login fail, Please check your code !',
      }
    }
    let checkPassword = customizeUser.checkPassword(password, user.password)
    if (checkPassword) {
      const code = user.studentCode
      let response = await verifyUser(code)
      return response
    } else {
      return {
        errCode: 2,
        message: 'Login fail, Please check your password !',
      }
    }
  } catch (error) {
    throw error
  }
}

const updateToken = async (refresh_token_old) => {
  try {
    let userRaw = await db.User.findOne({
      where: {
        refresh_token: refresh_token_old,
      },
      raw: false,
    })
    const user = userRaw?.dataValues
    if (user) {
      const refresh_token = uuidv4()
      const userClient = customizeUser.standardUser(user)
      const deletedAvatar = { ...userClient }
      delete deletedAvatar.avatar
      const token = handleJwt.signJwt(deletedAvatar, secret, expiresIn)
      userRaw.refresh_token = refresh_token
      userRaw.lastedOnline = null
      await userRaw.save()
      return {
        errCode: 100,
        message: 'Refresh token success',
        data: {
          user: userClient,
          refresh_token: refresh_token,
          access_token: token,
        },
      }
    } else {
      return {
        errCode: 1,
        message: 'Refresh token fail, Please check !',
      }
    }
  } catch (error) {
    throw error
  }
}

const updatePassword = async (id, phoneNumber, password) => {
  try {
    let userDB = await db.User.findOne({
      where: {
        phoneNumber: phoneNumber,
        id: id,
      },
      raw: false,
    })
    if (userDB) {
      userDB.password = hashPassword(password)
      await userDB.save()
      const user = customizeUser.standardUser(userDB.dataValues)
      return {
        errCode: 0,
        message: 'Update password success',
        user: user,
      }
    } else {
      return {
        errCode: 2,
        message: 'Fail, First, please register account',
      }
    }
  } catch (error) {
    throw error
  }
}

const changePassword = async (id, oldPassword, newPassword) => {
  try {
    let userDB = await User.findOne({
      _id: id,
    })
    if (userDB) {
      let checkPassword = customizeUser.checkPassword(
        oldPassword,
        userDB.password
      )
      if (checkPassword) {
        userDB.password = hashPassword(newPassword)
        await userDB.save()
        const user = customizeUser.standardUser(userDB.dataValues)
        return {
          errCode: 0,
          message: 'Change password success',
          user: user,
        }
      }
      return {
        errCode: 3,
        message: 'Not equal password for user. Please check !',
      }
    } else {
      return {
        errCode: 2,
        message: 'Fail, First, please register account',
      }
    }
  } catch (error) {
    throw error
  }
}

module.exports = {
  register,
  verifyUser,
  login,
  updateToken,
  updatePassword,
  changePassword,
}
