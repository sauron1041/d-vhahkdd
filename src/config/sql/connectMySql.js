import { Sequelize } from 'sequelize';
import config from '../sql/config/config';

const connectDB = async () => {
    const sequelize = new Sequelize(config[process.env.NODE_ENV]);
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.'.bgCyan);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectDB;

