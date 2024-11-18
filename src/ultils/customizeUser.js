import bcrypt from 'bcrypt';
const saltRounds = 10;
const keyUserRegister = ['id', 'phoneNumber', 'userName', 'avatar', 'lastedOnline', 'peerId'];
const keyProfile = ['birthdate', 'gender', 'soundTrack', 'coverImage', 'description'];

const hashPassword = (myPlaintextPassword) => {
    try {
        const salt = bcrypt.genSaltSync(saltRounds);
        return bcrypt.hashSync(myPlaintextPassword, salt);
    } catch (error) {
        throw error;
    }
}

const checkPassword = (myPlaintextPassword, hashedPassword) => {
    try {
        return bcrypt.compareSync(myPlaintextPassword, hashedPassword); // true
    } catch (error) {
        throw error;
    }
}

const standardUser = (user) => {
    try {
        let myUser = { ...user };
        if (myUser.avatar) {
            const avatar = myUser.avatar;
            const base64 = Buffer.from(avatar, 'base64');
            myUser.avatar = base64.toString();
        }
        for (let key in myUser)
            if (!keyUserRegister.includes(key))
                delete myUser[key];
        return myUser;
    } catch (error) {
        throw error;
    }
}

const standardProfile = (profile) => {
    try {
        let myProfile = { ...profile };
        for (let key in myProfile)
            if (!keyProfile.includes(key))
                delete myProfile[key];
        return myProfile;
    } catch (error) {
        throw error;
    }
}



module.exports = {
    standardUser,
    hashPassword,
    checkPassword,
    standardProfile
}