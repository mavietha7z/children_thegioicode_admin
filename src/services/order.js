import request from '~/utils';

export const requestAuthGetOrders = async (page) => {
    try {
        const res = await request.get('/manages/orders', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyOrder = async (id) => {
    try {
        const res = await request.delete('/manages/orders/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetCart = async (page) => {
    try {
        const res = await request.get('/manages/cart', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCart = async (id, type) => {
    try {
        const res = await request.put(
            '/manages/cart/update',
            {},
            {
                params: {
                    type,
                    id,
                },
            },
        );

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
