import request from '~/utils';

export const requestAuthGetSources = async (page, id) => {
    try {
        const res = await request.get('/manages/sources', {
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

export const requestAuthCreateSource = async (data) => {
    try {
        const res = await request.post('/manages/sources/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroySource = async (id) => {
    try {
        const res = await request.delete('/manages/sources/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateSource = async (id, type, data) => {
    try {
        const res = await request.put('/manages/sources/update', data, {
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
