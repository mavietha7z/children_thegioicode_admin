import request, { urlUpload } from '~/utils';

export const requestAuthUploadImage = async (data) => {
    try {
        const res = await request.post(urlUpload, data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
