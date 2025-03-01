import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Flex, Space, Input, Table, Pagination, Button, Breadcrumb, notification, Tooltip, Popconfirm } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyWalletHistory, requestAuthGetWalletHistories } from '~/services/wallet';

function WalletHistory() {
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
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

    const confirmDestroyWalletHistory = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID biến động số dư cần xoá',
            });
        }

        const result = await requestAuthDestroyWalletHistory(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneWalletHistories = [...walletHistories];

            const indexWalletHistory = cloneWalletHistories.findIndex((item) => item.key === id);
            if (indexWalletHistory === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy biến động số dư trong danh sách',
                });
            }

            cloneWalletHistories.splice(indexWalletHistory, 1);
            setWalletHistories(cloneWalletHistories);

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
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Flex align="center" gap={12}>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyWalletHistory(data.key)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small" className="box-center">
                                <IconTrash size={18} />
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Flex>
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
                    <Flex justify="end" className="responsive-item">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm kiếm"
                            style={{ width: 260 }}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
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
