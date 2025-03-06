import request from '~/utils';

// Apikey
export const requestAuthGetApiKeys = async (page) => {
    try {
        const res = await request.get('/manages/apikey', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthSearchApikey = async (keyword) => {
    try {
        const res = await request.get('/manages/apikey/search', {
            params: { keyword },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateApikey = async (type, id, data) => {
    try {
        const res = await request.put('/manages/apikey/update', data, {
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

// Public API
export const requestAuthGetApis = async (page, id) => {
    try {
        const res = await request.get('/manages/apis', {
            params: {
                page,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthAsyncApi = async () => {
    try {
        const res = await request.get('/manages/apis/async');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateApi = async (id, data) => {
    try {
        const res = await request.put('/manages/apis/update', data, {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetPlayersApi = async (service_id, page, type, id) => {
    try {
        const res = await request.get('/manages/apis/players', {
            params: {
                page,
                service_id,
                type,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthExportsPlayersApi = async (account_type, date_start, date_end) => {
    try {
        const res = await request.get('/manages/apis/players/exports', {
            params: {
                account_type,
                date_start,
                date_end,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetRequestsApi = async (page, service_id, type, id) => {
    try {
        const res = await request.get('/manages/apis/requests', {
            params: {
                page,
                service_id,
                type,
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
