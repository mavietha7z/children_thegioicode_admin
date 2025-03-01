import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Drawer, Flex, Spin, Switch, Table, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateOption, requestAuthGetUserbanks } from '~/services/app';

function CreateOption({ open, setOpen, paygateId, callback, setCallback }) {
    const [loading, setLoading] = useState(false);
    const [userBanks, setUserBanks] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        setLoading(true);
        const fetch = async () => {
            const result = await requestAuthGetUserbanks();

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setUserBanks(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateOptionPaygate = async (userbank_id) => {
        if (!userbank_id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn tài khoản cần thêm',
            });
        }
        if (!paygateId) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn cổng thanh toán',
            });
        }

        const data = {
            userbank_id,
            paygate_id: paygateId,
        };

        const result = await requestAuthCreateOption(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);

            setOpen(false);
            notification.success({
                message: 'Thông báo',
                description: result.message,
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `#${id}`,
        },
        {
            title: 'Chủ tài khoản',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Link to={`${router.users}?id=${user._id}`} target="_blank">
                    <span>{user.full_name}</span>
                    <br />
                    <span>{user.email}</span>
                </Link>
            ),
        },
        {
            title: 'Local bank',
            dataIndex: 'localbank',
            key: 'localbank',
            render: (localbank) => (
                <Link to={`${router.localbank}?localbank_id=${localbank._id}`} target="_blank">
                    <span>{localbank.sub_name}</span>
                    <br />
                    <span>{localbank.full_name}</span>
                </Link>
            ),
        },
        {
            title: 'Thông tin',
            key: 'info',
            render: (data) => (
                <Fragment>
                    <span>{data.account_number}</span>
                    <br />
                    <span>{data.account_holder}</span>
                </Fragment>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Switch checkedChildren="Bật" unCheckedChildren="Tắt" value={status} />,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Button className="box-center" type="primary" size="small" onClick={() => handleCreateOptionPaygate(data.key)}>
                    Thêm
                </Button>
            ),
        },
    ];

    return (
        <Drawer
            title="Danh sách tài khoản"
            width={1200}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    padding: 0,
                },
            }}
        >
            <Card style={{ minHeight: 'calc(-144px + 100vh)' }} styles={{ body: { padding: 12 } }}>
                {!loading ? (
                    <Table columns={columns} dataSource={userBanks} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}
            </Card>
        </Drawer>
    );
}

export default CreateOption;
