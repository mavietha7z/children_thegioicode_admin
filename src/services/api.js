import request from '~/utils';

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

export const requestAuthCreateApi = async (data) => {
    try {
        const res = await request.post('/manages/apis/create', data);

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

export const requestAuthDestroyApi = async (id) => {
    try {
        const res = await request.delete('/manages/apis/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetDocumentApi = async (service_id) => {
    try {
        const res = await request.get('/manages/apis/document', {
            params: {
                service_id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateDocumentApi = async (service_id, data) => {
    try {
        const res = await request.put('/manages/apis/document', data, {
            params: {
                service_id,
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
