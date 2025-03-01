import router from './routes';
import { message } from 'antd';

// Hàm chuyển đổi số tiền thành chuỗi
export const convertCurrency = (number) => {
    if (number == null || number === undefined) {
        return 'Null';
    }

    const amount = Number(number);
    let check = typeof amount === 'number' ? true : false;

    return check ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ' : 'Null';
};

export const generateCateString = (str, maxLength = 10) => {
    if (!str) {
        return 'Null';
    }
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
};

export const serviceCopyKeyBoard = (text) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('Đã sao chép vào keyboard');
        })
        .catch((err) => {
            message.error(`Lỗi sao chép ${err}`);
        });
};

export function checkImage(urlImage) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            resolve(urlImage);
        };

        img.onerror = function () {
            reject(null);
        };

        img.src = urlImage;
    });
}

// Tính ngày hết hạn
export const calculateDaysLeft = (expirationDate) => {
    const currentDate = new Date();
    const expireDate = new Date(expirationDate);

    const timeDifference = expireDate - currentDate;

    const expiredLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (timeDifference <= 0) {
        return `Hết hạn ${Math.abs(expiredLeft)} ngày`;
    }

    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (daysLeft >= 1) {
        return `Còn ${daysLeft} ngày`;
    }

    const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    return `Còn ${hoursLeft} giờ ${minutesLeft} phút`;
};

// Hàm lấy base64
export const configGetBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const config = {
    router,
};

export default config;
