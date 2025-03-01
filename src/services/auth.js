import request from '~/utils';

export const requestLoginAuth = async (user) => {
    try {
        const res = await request.post('/manages/auth/login', user);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestVerifyLoginAuth = async (data) => {
    try {
        const res = await request.post('/manages/auth/verify-login', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestLogoutAuth = async () => {
    try {
        const res = await request.post('/manages/auth/logout');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestGetCurrentAuth = async () => {
    try {
        const res = await request.get('/manages/auth/current-user', {
            params: {
                _v: Math.random(),
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetNotifications = async () => {
    try {
        const res = await request.get('/manages/auth/notifications');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUnreadNotification = async (data) => {
    try {
        const res = await request.post('/manages/auth/notifications/unread', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
