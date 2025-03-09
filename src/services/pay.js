import request from '~/utils';

export const requestAuthGetInvoices = async (page, id, invoice_id) => {
    try {
        const res = await request.get('/manages/invoices', {
            params: {
                page,
                id,
                invoice_id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyInvoice = async (id) => {
    try {
        const res = await request.delete('/manages/invoices/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthGetChargings = async (page) => {
    try {
        const res = await request.get('/manages/chargings', {
            params: {
                page,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthDestroyCharging = async (id) => {
    try {
        const res = await request.delete('/manages/chargings/destroy', {
            params: {
                id,
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
