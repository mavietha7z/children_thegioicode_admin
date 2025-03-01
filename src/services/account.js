import request from '~/utils';

export const requestAuthGetUsers = async (page, id) => {
    try {
        const res = await request.get('/manages/users', {
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

export const requestAuthLogoutAllUsers = async () => {
    try {
        const res = await request.get('/manages/users/logout-all');

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateUser = async (id, data) => {
    try {
        const res = await request.put('/manages/users/update', data, {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthRegisterUser = async (data) => {
    try {
        const res = await request.post('/manages/users/register', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyUser = async (id) => {
    try {
        const res = await request.delete('/manages/users/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetLoginHistoriesUsers = async (page) => {
    try {
        const res = await request.get('/manages/users/login-histories', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthSearchLoginHistoriesUser = async (page, keyword) => {
    try {
        const res = await request.get('/manages/users/login-histories/search', {
            params: {
                page,
                keyword,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthSearchUser = async (keyword, type = null) => {
    try {
        const res = await request.get('/manages/users/search', {
            params: { type, keyword },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetMemberships = async (page, id) => {
    try {
        const res = await request.get('/manages/memberships', {
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

export const requestAuthUpdateMembership = async (id, type, data) => {
    try {
        const res = await request.put('/manages/memberships/update', data, {
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
