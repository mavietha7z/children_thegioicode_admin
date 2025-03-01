import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconShoppingBag } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Flex, Spin, Input, Badge, Space, Table, Button, Switch, Tooltip, Pagination, Breadcrumb, notification } from 'antd';

import CartDetail from './CartDetail';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetCart, requestAuthUpdateCart } from '~/services/order';

function Cart() {
    const [cart, setCart] = useState(null);
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openListCart, setOpenListCart] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách giỏ hàng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetCart(page);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setCarts(result.data);
                setPages(result.pages);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleToggleStatusCart = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID giỏ hàng cần thay đổi',
            });
        }

        const result = await requestAuthUpdateCart(id, 'status');

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneCarts = [...carts];

            const indexCart = cloneCarts.findIndex((item) => item.key === id);
            if (indexCart === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy giỏ hàng trong danh sách',
                });
            }

            cloneCarts[indexCart].status = !cloneCarts[indexCart].status;
            setCarts(cloneCarts);

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
            title: 'Trạng thái',
            key: 'status',
            render: (data) => {
                return (
                    <Switch
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        value={data.status}
                        onChange={() => handleToggleStatusCart(data.key)}
                    />
                );
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
                <Tooltip title="Xem giỏ hàng">
                    <Badge size="small" count={data.products.length}>
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setCart(data);
                                setOpenListCart(true);
                            }}
                        >
                            <IconShoppingBag size={18} />
                        </Button>
                    </Badge>
                </Tooltip>
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
                                    title: 'Giỏ hàng',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm" style={{ width: 260 }} />
                    </Flex>
                </Flex>
            </Card>

            {openListCart && <CartDetail open={openListCart} setOpen={setOpenListCart} cart={cart} />}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={carts} pagination={false} />
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

export default Cart;
