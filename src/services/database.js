import request from '~/utils';

export const requestAuthExportDatabase = async (data) => {
    try {
        const res = await request.post('/manages/databases/export', data);

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};

export const requestAuthImportDatabase = async (collection, data) => {
    try {
        const res = await request.post('/manages/databases/import', data, {
            params: {
                collection,
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return res.data;
    } catch (error) {
        return error.response?.data;
    }
};
