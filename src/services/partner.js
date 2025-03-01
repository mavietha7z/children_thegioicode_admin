import request from '~/utils';

export const requestAuthGetPartners = async (page, id) => {
    try {
        const res = await request.get('/manages/partners', {
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

export const requestAuthUpdatePartner = async (id, type, data) => {
    try {
        const res = await request.put('/manages/partners/update', data, {
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

export const requestAuthGetServices = async (page, partner_id) => {
    try {
        const res = await request.get('/manages/partners/services', {
            params: {
                page,
                partner_id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateService = async (id, type, data) => {
    try {
        const res = await request.put('/manages/partners/services/update', data, {
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
