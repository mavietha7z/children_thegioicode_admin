import request from '~/utils';

export const requestAuthGetTemplates = async (page, id) => {
    try {
        const res = await request.get('/manages/templates', {
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

export const requestAuthCreateTemplate = async (data) => {
    try {
        const res = await request.post('/manages/templates/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateTemplate = async (id, type, data) => {
    try {
        const res = await request.put('/manages/templates/update', data, {
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

export const requestAuthDestroyTemplate = async (id) => {
    try {
        const res = await request.delete('/manages/templates/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetOrderTemplates = async (page) => {
    try {
        const res = await request.get('/manages/templates/orders', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateOrderTemplate = async (id, data) => {
    try {
        const res = await request.put('/manages/templates/orders/update', data, {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyOrderTemplate = async (id) => {
    try {
        const res = await request.delete('/manages/templates/orders/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthSearchOrderTemplate = async (keyword) => {
    try {
        const res = await request.get('/manages/templates/orders/search', {
            params: {
                keyword,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
