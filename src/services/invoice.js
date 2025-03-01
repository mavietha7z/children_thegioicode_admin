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
