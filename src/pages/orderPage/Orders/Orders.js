import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconFileDescription, IconShoppingBag, IconTrash } from '@tabler/icons-react';
import { Badge, Breadcrumb, Button, Card, Flex, Input, notification, Pagination, Popconfirm, Space, Spin, Table, Tooltip } from 'antd';

import router from '~/configs/routes';
import OrderDetail from './OrderDetail';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyOrder, requestAuthGetOrders } from '~/services/order';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách đơn hàng';

        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetOrders(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setOrders(result.data);
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

    // Xoá
    const confirmDestroyOrder = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đơn hàng cần xoá',
            });
        }
        const result = await requestAuthDestroyOrder(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOrders = [...orders];

            const indexOrder = cloneOrders.findIndex((item) => item.key === id);
            if (indexOrder === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đơn hàng trong danh sách',
                });
            }

            cloneOrders.splice(indexOrder, 1);
            setOrders(cloneOrders);

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
            title: 'Mã hoá đơn',
            dataIndex: 'invoice_id',
            key: 'invoice_id',
            render: (invoice_id) => (
                <Link to={`${router.invoices}?invoice_id=${invoice_id}`} target="_blank">
                    #{invoice_id}
                </Link>
            ),
        },
        {
            title: 'Điểm thưởng',
            dataIndex: 'bonus_point',
            key: 'bonus_point',
            render: (bonus_point) => <Fragment>{convertCurrency(bonus_point).slice(0, -1)} điểm</Fragment>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'total_payment',
            key: 'total_payment',
            render: (total_payment) => convertCurrency(total_payment),
        },
        {
            title: 'Phương thức',
            dataIndex: 'pay_method',
            key: 'pay_method',
            render: (pay_method) => {
                let title = '';
                if (pay_method === 'credit_card') {
                    title = 'Thẻ tín dụng';
                }
                if (pay_method === 'debit_card') {
                    title = 'Thẻ ghi nợ';
                }
                if (pay_method === 'bank_transfer') {
                    title = 'Chuyển khoản';
                }
                if (pay_method === 'app_wallet') {
                    title = 'Ví Netcode';
                }
                return <Fragment>{title}</Fragment>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let className = '';
                let title = '';
                let style = {};

                if (status === 'completed') {
                    title = 'Hoàn thành';
                    className = 'label-light-success font-weight-bold';
                    style = { backgroundColor: '#4caf501a', color: '#4caf50', border: '1px solid #4caf501a' };
                }
                if (status === 'pending') {
                    title = 'Chờ thanh toán';
                    className = 'label-light-warning font-weight-bold';
                    style = { backgroundColor: '#ff98001a', color: '#ff9800', border: '1px solid #ff98001a' };
                }
                if (status === 'canceled') {
                    title = 'Đã huỷ';
                    className = 'label-light-danger font-weight-bold';
                    style = { backgroundColor: '#f443361a', color: '#f44336', border: '1px solid #f443361a' };
                }

                return (
                    <div className={className} style={style}>
                        {title}
                    </div>
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
                <Flex align="center" gap={10}>
                    <Tooltip title="Xem nội dung">
                        <Button
                            type="primary"
                            size="small"
                            className="box-center"
                            onClick={() => notification.error({ message: 'Thông báo', description: 'Chức năng đang được phát triển' })}
                        >
                            <IconFileDescription size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xem đơn hàng">
                        <Badge size="small" count={data.products.length}>
                            <Button
                                type="primary"
                                size="small"
                                className="box-center"
                                onClick={() => {
                                    setProducts(data.products);
                                    setOpenDetail(true);
                                }}
                            >
                                <IconShoppingBag size={18} />
                            </Button>
                        </Badge>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyOrder(data.key)}
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
                                    title: 'Danh sách đơn hàng',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm" style={{ width: 260 }} />
                    </Flex>
                </Flex>
            </Card>

            {openDetail && products && <OrderDetail open={openDetail} setOpen={setOpenDetail} products={products} />}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={orders} pagination={false} />
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

export default Orders;
