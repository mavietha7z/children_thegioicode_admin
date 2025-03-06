import request from '~/utils';

// Region
export const controlAuthGetCloudServerRegion = async (page, id) => {
    try {
        const res = await request.get('/manages/cloud-server/regions', {
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

export const requestAuthAsyncCloudServerRegion = async () => {
    try {
        const res = await request.get('/manages/cloud-server/regions/async');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCloudServerRegion = async (id, type, data) => {
    try {
        const res = await request.put('/manages/cloud-server/regions/update', data, {
            params: { type, id },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Image
export const controlAuthGetCloudServerImages = async (page) => {
    try {
        const res = await request.get('/manages/cloud-server/images', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthAsyncCloudServerImage = async () => {
    try {
        const res = await request.get('/manages/cloud-server/images/async');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCloudServerImage = async (id, type, data) => {
    try {
        const res = await request.put('/manages/cloud-server/images/update', data, {
            params: { type, id },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Product
export const controlAuthGetCloudServerProduct = async (page, id) => {
    try {
        const res = await request.get('/manages/cloud-server/products', {
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

export const requestAuthAsyncCloudServerProduct = async () => {
    try {
        const res = await request.get('/manages/cloud-server/products/async');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCloudServerProduct = async (id, type, data) => {
    try {
        const res = await request.put('/manages/cloud-server/products/update', data, {
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

// Order
export const controlAuthGetCloudServerOrder = async (page) => {
    try {
        const res = await request.get('/manages/cloud-server/orders', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthAsyncCloudServerOrder = async () => {
    try {
        const res = await request.get('/manages/cloud-server/orders/async');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
