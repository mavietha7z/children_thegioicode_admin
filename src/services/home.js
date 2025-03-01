import request from '~/utils';

export const requestAuthGetDataDashboard = async () => {
    try {
        const res = await request.get('/manages/dashboard');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
