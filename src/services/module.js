import request from '~/utils';

// Token
export const requestAuthGetTokenUsers = async (page) => {
    try {
        const res = await request.get('/manages/tokens', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyTokenUser = async (id) => {
    try {
        const res = await request.delete('/manages/tokens/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Cycles
export const requestAuthGetCycles = async (page, id) => {
    try {
        const res = await request.get('/manages/cycles', {
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

export const requestAuthGetCyclesInitialize = async () => {
    try {
        const res = await request.get('/manages/cycles/initialize');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateCycles = async (data) => {
    try {
        const res = await request.post('/manages/cycles/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCycles = async (type, id, data) => {
    try {
        const res = await request.put('/manages/cycles/update', data, {
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

export const requestAuthDestroyCycles = async (id) => {
    try {
        const res = await request.delete('/manages/cycles/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Pricing
export const requestAuthGetPricing = async (page, id, service_id) => {
    try {
        const res = await request.get('/manages/pricings', {
            params: {
                page,
                id,
                service_id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdatePricing = async (type, id, data) => {
    try {
        const res = await request.put('/manages/pricings/update', data, {
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

export const requestAuthDestroyPricing = async (id) => {
    try {
        const res = await request.delete('/manages/pricings/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreatePricing = async (data) => {
    try {
        const res = await request.post('/manages/pricings/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Coupon
export const requestAuthGetCoupons = async (page) => {
    try {
        const res = await request.get('/manages/coupons', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthSearchCoupon = async (data) => {
    try {
        const res = await request.post('/manages/coupons/search', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateCoupon = async (data) => {
    try {
        const res = await request.post('/manages/coupons/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCoupon = async (type, id, data) => {
    try {
        const res = await request.put('/manages/coupons/update', data, {
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

export const requestAuthDestroyCoupon = async (id) => {
    try {
        const res = await request.delete('/manages/coupons/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
