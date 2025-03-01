import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Empty, Flex, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { serviceCopyKeyBoard } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetRequestsApi } from '~/services/api';

function DetailRequest({ open, setOpen, requestId }) {
    const [data, setData] = useState(null);
    const [empty, setEmpty] = useState(true);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (requestId) {
            const fetch = async () => {
                const result = await requestAuthGetRequestsApi(1, null, 'detail', requestId);

                if (result.status === 401 || result.status === 403) {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);
                } else if (result?.status === 200) {
                    setLoading(true);
                    setData(JSON.stringify(result.data, null, 3));
                } else {
                    setEmpty(false);
                    notification.error({
                        message: 'Thông báo',
                        description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                    });
                }
            };
            fetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId]);

    return (
        <Drawer
            title="Thông tin chi tiết"
            className="api-detail"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            {loading && empty ? (
                <div className="copy">
                    <pre>
                        <code className="text-copy">{data}</code>
                    </pre>

                    <div className="btn-copy">
                        <Button size="small" className="box-center" onClick={() => serviceCopyKeyBoard(data)}>
                            <IconCopy size={18} />
                        </Button>
                    </div>
                </div>
            ) : !loading && empty ? (
                <Flex style={{ height: '60vh' }} align="center" justify="center">
                    <Spin />
                </Flex>
            ) : (
                <Empty description="Lỗi lấy dữ liệu requests" />
            )}
        </Drawer>
    );
}

export default DetailRequest;
