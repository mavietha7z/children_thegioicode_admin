import request from '~/utils';

// Categories
export const requestAuthGetResourceCategories = async (page, id) => {
    try {
        const res = await request.get('/manages/resources/categories', {
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

export const requestAuthCreateResourceCategory = async (data) => {
    try {
        const res = await request.post('/manages/resources/categories/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateResourceCategory = async (id, type, data) => {
    try {
        const res = await request.put('/manages/resources/categories/update', data, {
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

export const requestAuthDestroyResourceCategory = async (id) => {
    try {
        const res = await request.delete('/manages/resources/categories/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Products
export const requestAuthGetResourceProducts = async (page, id, category_id) => {
    try {
        const res = await request.get('/manages/resources/products', {
            params: {
                page,
                id,
                category_id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetInitializeResourceProduct = async (page) => {
    try {
        const res = await request.get('/manages/resources/products/initialize', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateResourceProduct = async (data) => {
    try {
        const res = await request.post('/manages/resources/products/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateResourceProduct = async (id, type, data) => {
    try {
        const res = await request.put('/manages/resources/products/update', data, {
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

export const requestAuthDestroyResourceProduct = async (id) => {
    try {
        const res = await request.delete('/manages/resources/products/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

// Accounts
export const requestAuthGetResourceAccounts = async (page) => {
    try {
        const res = await request.get('/manages/resources/accounts', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetInitializeResourceAccount = async (page) => {
    try {
        const res = await request.get('/manages/resources/accounts/initialize', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthCreateResourceAccount = async (data) => {
    try {
        const res = await request.post('/manages/resources/accounts/create', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateResourceAccount = async (id, type, data) => {
    try {
        const res = await request.put('/manages/resources/accounts/update', data, {
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

export const requestAuthDestroyResourceAccount = async (id) => {
    try {
        const res = await request.delete('/manages/resources/accounts/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
