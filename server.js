import app from './app'
require('dotenv').config()
import userService from './src/services/user.service'
app.set('port', process.env.PORT)

const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`.rainbow)
})

// handle socket io

// Socket setup
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:8096', 'http://localhost:5500'],
  },
  maxHttpBufferSize: 1e8,
})

io.on('connection', function (socket) {
  socket.on('setup', (data) => {
    socket.join(data?.id || data)
    socket.emit('connected', socket.id)
  })
  socket.on('join-qr-room', function (room) {
    socket.join(room)
    socket.emit('joined', room)
  })

  socket.on('scan-success', function (data) {
    socket.in(data.room).emit('need-to-verify', data)
  })

  socket.on('join-room', (room) => {
    socket.join(room)
    socket.emit('joined-room', room)
  })

  socket.on('send-add-friend', (data) => {
    console.log('send-add-friend', data?.id)
    socket.in(data?.id).emit('need-accept-addFriend', data)
  })

  socket.on('send-message', (data) => {
    socket.in(data.chat).emit('receive-message', data)
  })

  socket.on('typing', (room) => {
    socket.in(room).emit('typing', room)
  })

  socket.on('finish-typing', (room) => {
    socket.in(room).emit('finish-typing', room)
  })

  socket.on('send-reaction', (data) => {
    socket.in(data.chat).emit('receive-reaction', data)
  })

  socket.on('modify-message', (data) => {
    socket.in(data.chat._id).emit('receive-modify-message', data)
  })

  socket.on('online', async (data) => {
    const res = await userService.findFriendsLimit(data, -1)
    if (res.errCode === 0) {
      const friendShips = res.data
      const friends = friendShips.map((friendShip) => {
        return friendShip.sender.id === data
          ? friendShip.receiver.id
          : friendShip.sender.id
      })
      friends.forEach((friend) => {
        socket.in(friend).emit('online', data)
      })
    }
  })

  socket.on('new-chat', (data) => {
    const participants = data.participants.map((participant) => participant.id)
    participants.forEach((participant) => {
      socket.in(participant).emit('new-chat', data)
    })
  })

  socket.on('offline', async (data) => {
    await userService.updateOnline(data, new Date())
    const res = await userService.findFriendsLimit(data, -1)
    if (res.errCode === 0) {
      const friendShips = res.data
      const friends = friendShips.map((friendShip) => {
        return friendShip.sender.id === data
          ? friendShip.receiver.id
          : friendShip.sender.id
      })
      friends.forEach((friend) => {
        socket.in(friend).emit('offline', data)
      })
    }
  })

  socket.on('transfer-disband-group', (data) => {
    socket.in(data._id).emit('transfer-disband-group', data)
  })

  socket.on('open-call', (data) => {
    socket.in(data.room).emit('open-call', data)
  })

  socket.on('join-call', (data) => {
    socket.join(data.room)
    socket.in(data.room).emit('user-connected', data.peerId)
  })

  socket.on('reject-call', (data) => {
    socket.in(data.room).emit('reject-call', data)
  })

  socket.on('add-member', (data) => {
    if (data?.participants) {
      data.participants.forEach((participant) => {
        socket.in(participant.id).emit('add-member', data)
      })
    }
  })

  socket.on('leave-group', (data) => {
    socket.in(data.chatId).emit('leave-group', data)
  })

  socket.on('grant', (data) => {
    socket.in(data._id).emit('grant', data)
  })

  socket.on('change-background', (data) => {
    socket.in(data.chatId).emit('change-background', data)
  })

  socket.on('delete-member', (data) => {
    socket.in(data._id).emit('delete-member', data)
  })

  socket.on('pin-message', (room) => {
    socket.in(room).emit('pin-message', room)
  })

  socket.on('dissolutionGroupChat', (data) => {
    socket.in(data._id).emit('dissolutionGroupChat', data)
  })

  socket.on('disconnect', (reason) => {
    console.log('disconnect', reason)
    // else the socket will automatically try to reconnect
  })
})
