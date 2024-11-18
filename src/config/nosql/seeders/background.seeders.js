const mongoose = require('mongoose');
const connectNoSql = require('../config');
const Background = require('../models/background.model');
connectNoSql();
// Dữ liệu mẫu bạn muốn thêm
const sampleBackgrounds = [
    {
        name: 'Tín hiệu từ vũ trụ',
        headerColor: 'WHITE',
        messageColor: 'BLACK',
        url: 'https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/hinh-nen-may-tinh-dep-a-19-1.jpg'
    },
    {
        name: 'Tín hiệu từ vũ trụ',
        headerColor: 'WHITE',
        messageColor: 'BLACK',
        url: 'https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-hinh-nen-trai-dat-va-mat-troi.jpg'
    },
    {
        name: 'Hình nền Trái Tim đẹp',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://png.pngtree.com/thumb_back/fw800/background/20240204/pngtree-beautiful-hearts-valentine-day-background-image_15604624.png'
    },
    {
        name: 'Hồng cute 1',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://img6.thuthuatphanmem.vn/uploads/2022/09/28/anh-hinh-nen-mau-hong_081220225.jpg'
    },
    {
        name: 'Hồng cute 2',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://img6.thuthuatphanmem.vn/uploads/2022/09/28/hinh-nen-trai-tim-tinh-yeu-cute-mau-hong_081230715.jpg'
    },
    {
        name: 'Hồng cute 3',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://phunugioi.com/wp-content/uploads/2020/08/hinh-nen-mau-hong-trai-tim-tinh-yeu.jpg'
    },
    {
        name: 'Hồng cute 4',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://demoda.vn/wp-content/uploads/2022/01/hinh-nen-trai-tim-dep-tao-thanh-tu-bong-bong-nuoc.jpg'
    },
    {
        name: 'Xe hơi',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://i.pinimg.com/originals/b0/0d/0c/b00d0cdbf06fab3b2d8cc6847a014495.jpg'
    },
    {
        name: 'Lamborghini Concepts',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/gateway-family/concept/2020_06/c_overview_01_M.jpg'
    },
    {
        name: 'Ô tô bóng nước',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://carshop.vn/wp-content/uploads/2022/07/hinh-nen-o-to-65.jpg'
    },
    {
        name: 'Sci Fi Cyberpunk HD Wallpaper',
        headerColor: 'BLACK',
        messageColor: 'BLACK',
        url: 'https://images8.alphacoders.com/112/1128361.jpg'
    },

];

// Thêm dữ liệu vào cơ sở dữ liệu
async function seedBackgrounds() {
    try {
        await Background.deleteMany(); // Xóa tất cả các dữ liệu trong collection trước khi thêm mới
        const createdBackgrounds = await Background.insertMany(sampleBackgrounds); // Thêm dữ liệu vào collection
        console.log('Sample backgrounds created:', createdBackgrounds);
    } catch (error) {
        console.error('Error seeding backgrounds:', error);
    } finally {
        mongoose.disconnect(); // Ngắt kết nối sau khi hoàn thành thêm dữ liệu
    }
}

// Gọi hàm seedBackgrounds để thêm dữ liệu
seedBackgrounds();
