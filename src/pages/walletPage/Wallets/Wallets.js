import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconCoin } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tag, Card, Flex, Spin, Space, Table, Input, Button, Tooltip, Pagination, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import useDebounce from '~/hooks/useDebounce';
import WalletDetail from './WalletDetail/WalletDetail';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetWallets, requestAuthSearchWallet } from '~/services/wallet';

function Wallets() {
    const [wallet, setWallet] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [openWallet, setOpenWallet] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');
    const debounce = useDebounce(searchValue, 800);

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách ví';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetWallets(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setWallets(result.data);
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
    }, [page, id]);

    // Search
    useEffect(() => {
        if (debounce.length < 1) {
            return;
        }

        const fetch = async () => {
            const result = await requestAuthSearchWallet(debounce);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(1);
                setWallets(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };

        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounce]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `#${id}`,
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
            title: 'Tiền tệ',
            dataIndex: 'currency',
            key: 'currency',
        },
        {
            title: 'Khuyến mãi',
            key: 'bonus',
            render: (data) => {
                return (
                    <Fragment>
                        <Tooltip title="Điểm khuyễn mãi còn lại">
                            <span className="text-warning">{convertCurrency(data.bonus_point).slice(0, -1)}</span>
                        </Tooltip>
                        <br />
                        <Tooltip title="Tổng điểm khuyễn mãi đã nhận">
                            <span className="text-success">{convertCurrency(data.total_bonus_point).slice(0, -1)}</span>
                        </Tooltip>
                    </Fragment>
                );
            },
        },
        {
            title: 'Số dư ví',
            dataIndex: 'total_balance',
            key: 'total_balance',
            render: (total_balance) => (
                <Tooltip title="Tổng số dư có thể sử dụng">
                    <span className="text-success">{convertCurrency(total_balance)}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Số dư chính',
            dataIndex: 'main_balance',
            key: 'main_balance',
            render: (main_balance) => <Tooltip title="Số dư này có thể rút">{convertCurrency(main_balance)}</Tooltip>,
        },
        {
            title: 'Tổng nạp/rút',
            key: 'total_recharge_withdrawal',
            render: (data) => {
                return (
                    <Fragment>
                        <span>{convertCurrency(data.total_recharge)}</span>
                        <br />
                        <span>{convertCurrency(data.total_withdrawal)}</span>
                    </Fragment>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '#52c41a';
                let message = 'Hoạt động';
                if (status === 'inactivated') {
                    color = '#ffa940';
                    message = 'Tạm khoá';
                }
                if (status === 'deleted') {
                    color = '#ff4d4f';
                    message = 'Đã xoá';
                }
                return <Tag color={color}>{message.toUpperCase()}</Tag>;
            },
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
                <Space>
                    <Tooltip title="Nạp/rút">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setWallet(data);
                                setOpenWallet(true);
                            }}
                        >
                            <IconCoin size={18} />
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card
                styles={{
                    body: {
                        padding: 12,
                    },
                }}
            >
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
                                    title: 'Danh sách ví',
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

            {openWallet && wallet && (
                <WalletDetail open={openWallet} setOpen={setOpenWallet} wallet={wallet} callback={wallets} setCallback={setWallets} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={wallets} pagination={false} />
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

export default Wallets;
