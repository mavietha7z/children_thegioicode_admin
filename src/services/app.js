import request from '~/utils';

export const requestAuthGetInfoApps = async () => {
    try {
        const res = await request.get('/manages/apps/info');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateInfoApps = async (data) => {
    try {
        const res = await request.put('/manages/apps/info/update', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetConfigSendMail = async () => {
    try {
        const res = await request.get('/manages/apps/sendmail-config');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateConfigSendMail = async (data) => {
    try {
        const res = await request.put('/manages/apps/sendmail-config/update', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetNewsFeed = async (page, type, id) => {
    try {
        const res = await request.get('/manages/news-feeds', {
            params: {
                page,
                type,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthPublishNewsFeed = async (data) => {
    try {
        const res = await request.post('/manages/news-feeds/publish', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateNewsFeed = async (id, type, data) => {
    try {
        const res = await request.put('/manages/news-feeds/update', data, {
            params: {
                type,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyNewsFeed = async (id) => {
    try {
        const res = await request.delete('/manages/news-feeds/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetPaygates = async () => {
    try {
        const res = await request.get('/manages/paygates');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreatePaygate = async (data) => {
    try {
        const res = await request.post('/manages/paygates/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdatePaygate = async (id, type, data) => {
    try {
        const res = await request.put('/manages/paygates/update', data, {
            params: {
                type,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyPaygate = async (id) => {
    try {
        const res = await request.delete('/manages/paygates/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetOptionsPaygates = async (id) => {
    try {
        const res = await request.get('/manages/paygates/options', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetUserbanks = async () => {
    try {
        const res = await request.get('/manages/paygates/options/userbanks');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateOption = async (data) => {
    try {
        const res = await request.post('/manages/paygates/options/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateOptionPaygate = async (data) => {
    try {
        const res = await request.put('/manages/paygates/options/update', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyOptionPaygate = async (data) => {
    try {
        const res = await request.put('/manages/paygates/options/destroy', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
