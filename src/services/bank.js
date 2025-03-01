import request from '~/utils';

export const requestAuthGetLocalbanks = async (page, id) => {
    try {
        const res = await request.get('/manages/localbank', {
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

export const requestAuthCreateLocalbank = async (data) => {
    try {
        const res = await request.post('/manages/localbank/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateLocalbank = async (id, type, data) => {
    try {
        const res = await request.put('/manages/localbank/update', data, {
            params: { type, id },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyLocalbank = async (id) => {
    try {
        const res = await request.delete('/manages/localbank/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetUserbanks = async (page) => {
    try {
        const res = await request.get('/manages/userbanks', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetSearchUserbanks = async (type, keyword) => {
    try {
        const res = await request.get('/manages/userbanks/create-search', {
            params: {
                type,
                keyword,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateUserbank = async (data) => {
    try {
        const res = await request.post('/manages/userbanks/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateUserbank = async (id, type, data) => {
    try {
        const res = await request.put('/manages/userbanks/update', data, {
            params: { type, id },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyUserbank = async (id) => {
    try {
        const res = await request.delete('/manages/userbanks/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
