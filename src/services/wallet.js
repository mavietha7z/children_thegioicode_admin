import request from '~/utils';

export const requestAuthGetWallets = async (page, id) => {
    try {
        const res = await request.get('/manages/wallets', {
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

export const requestAuthSearchWallet = async (keyword) => {
    try {
        const res = await request.get('/manages/wallets/search', {
            params: { keyword },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthUpdateWallet = async (id, data) => {
    try {
        const res = await request.put('/manages/wallets/update', data, {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetWalletHistories = async (page) => {
    try {
        const res = await request.get('/manages/wallets/histories', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetBonusPoints = async (page) => {
    try {
        const res = await request.get('/manages/bonus-points', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyBonusPoint = async (id) => {
    try {
        const res = await request.delete('/manages/bonus-points/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
