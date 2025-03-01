import request from '~/utils';

export const controlAuthGetCloudServerPartner = async () => {
    try {
        const res = await request.get('/manages/cloud-server/partners');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const controlAuthCreateCloudServerPartner = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/partners/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCloudServerPartner = async (id, type, data) => {
    try {
        const res = await request.put('/manages/cloud-server/partners/update', data, {
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

export const requestAuthDestroyCloudServerPartner = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/partners/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

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

export const requestAuthCreateCloudServerRegion = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/regions/create', data);

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

export const controlAuthDestroyCloudServerRegion = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/regions/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthAddPlanToCloudServerRegion = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/regions/add-plan', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthRemovePlanInCloudServerRegion = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/regions/remove-plan', data);

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

export const requestAuthCreateCloudServerImage = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/images/create', data);

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

export const controlAuthDestroyCloudServerImage = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/images/destroy', {
            params: {
                id,
            },
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

export const requestAuthCreateCloudServerProduct = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/products/create', data);

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

export const controlAuthDestroyCloudServerProduct = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/products/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Plan
export const controlAuthGetCloudServerPlans = async (page, id) => {
    try {
        const res = await request.get('/manages/cloud-server/plans', {
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

export const requestAuthCreateCloudServerPlan = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/plans/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateCloudServerPlan = async (id, type, data) => {
    try {
        const res = await request.put('/manages/cloud-server/plans/update', data, {
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

export const controlAuthDestroyCloudServerPlan = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/plans/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const controlAuthGetInitializeCloudServerPlans = async () => {
    try {
        const res = await request.get('/manages/cloud-server/plans/initialize');

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

export const controlAuthDestroyCloudServerOrder = async (id) => {
    try {
        const res = await request.delete('/manages/cloud-server/orders/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateCloudServerOrder = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/orders/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthChangePasswordCloudServerOrder = async (data) => {
    try {
        const res = await request.post('/manages/cloud-server/orders/password', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const controlAuthGetCloudServerTryIt = async () => {
    try {
        const res = await request.get('/manages/cloud-server/try-it');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
