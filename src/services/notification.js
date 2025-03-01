import request from '~/utils';

export const requestAuthGetNotifications = async (service, page) => {
    try {
        const res = await request.get('/manages/notifications', {
            params: { service, page },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyNotification = async (id) => {
    try {
        const res = await request.delete('/manages/notifications/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
