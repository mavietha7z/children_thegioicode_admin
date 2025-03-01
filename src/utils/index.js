import axios from 'axios';

export const baseURL = 'http://localhost:8080/api';

export const urlUpload = `${baseURL}/upload/image`;

const request = axios.create({
    baseURL,
    withCredentials: true,
});

export default request;
