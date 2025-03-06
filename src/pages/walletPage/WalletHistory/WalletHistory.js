import moment from 'moment';
import { useDispatch } from 'react-redux';
import { IconArrowLeft } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Flex, Space, Table, Pagination, Button, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetWalletHistories } from '~/services/wallet';

function WalletHistory() {
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [walletHistories, setWalletHistories] = useState([]);

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Biến động số dư người dùng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetWalletHistories(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setWalletHistories(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
            setLoading(false);
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Fragment>#{id}</Fragment>,
        },
        {
            title: 'Khách hàng',
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
            title: 'Loại GD',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                let title = '';

                if (type === 'deposit') {
                    title = 'Cộng tiền';
                }
                if (type === 'withdraw') {
                    title = 'Trừ tiền';
                }
                if (type === 'service') {
                    title = 'Dịch vụ';
                }
                if (type === 'recharge') {
                    title = 'Nạp tiền';
                }
                if (type === 'withdrawal') {
                    title = 'Rút tiền';
                }

                return <Fragment>{title}</Fragment>;
            },
        },
        {
            title: 'Trước GD',
            dataIndex: 'before',
            key: 'before',
            render: (before) => <Fragment>{convertCurrency(before)}</Fragment>,
        },
        {
            title: 'Số tiền',
            key: 'amount',
            render: (data) => {
                let title = '';
                let className = '';
                if (data.type === 'deposit' || data.type === 'recharge') {
                    className = 'text-success';
                    title = `+${convertCurrency(data.amount)}`;
                }
                if (data.type === 'withdraw' || data.type === 'service' || data.type === 'withdrawal') {
                    className = 'text-danger';
                    title = `${convertCurrency(data.amount)}`;
                }
                return <span className={className}>{title}</span>;
            },
        },
        {
            title: 'Sau GD',
            dataIndex: 'after',
            key: 'after',
            render: (after) => <Fragment>{convertCurrency(after)}</Fragment>,
        },
        {
            title: 'Nội dung',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Ngày tạo/cập nhật',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    <span>{moment(data.updated_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                </Fragment>
            ),
        },
    ];

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card styles={{ body: { padding: 12 } }}>
                <Flex justify="space-between" align="center" className="responsive-flex">
                    <Flex className="gap-2 responsive-item" align="center">
                        <Button size="small" className="box-center" onClick={() => navigate(router.home)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: 'Biến động số dư',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={walletHistories} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}

                {Number(pages) > 1 && (
                    <Flex justify="end" style={{ margin: '20px 0 10px 0' }}>
                        <Pagination
                            current={page || 1}
                            pageSize={20}
                            total={Number(pages) * 20}
                            onChange={(page) => {
                                setPage(page);
                                setSearchParams({ page });
                            }}
                        />
                    </Flex>
                )}
            </Card>
        </Space>
    );
}

export default WalletHistory;
