import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconTrash, IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Flex, Spin, Space, Table, Button, Tooltip, Popconfirm, Pagination, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyOrderSource, requestAuthGetOrderSources } from '~/services/source';

function OrderSource() {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách đơn mã nguồn';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetOrderSources(page);

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

    // Destroy
    const confirmDestroyOrderSource = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đơn mã nguồn cần xoá',
            });
        }
        const result = await requestAuthDestroyOrderSource(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOrders = [...orders];

            const orderIndex = cloneOrders.findIndex((item) => item.key === id);
            if (orderIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đơn mã nguồn trong danh sách',
                });
            }

            cloneOrders.splice(orderIndex, 1);
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
            title: 'Mã nguồn',
            dataIndex: 'source',
            key: 'source',
            render: (source) => {
                return (
                    <Link to={`${router.sources}?id=${source._id}`} target="_blank">
                        {source.title}
                    </Link>
                );
            },
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
            title: 'Số tiền',
            key: 'price',
            render: (data) => (
                <Fragment>
                    {data.discount > 0 && (
                        <div className="text-danger font-size-13 text-line-through">{convertCurrency(data.unit_price)}</div>
                    )}
                    <div className="font-size-15">
                        {convertCurrency(data.unit_price - (data.unit_price * data.quantity * data.discount) / 100)}
                    </div>
                </Fragment>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let className = '';
                let style = {};
                let title = '';

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

                return (
                    <div className={className} style={style}>
                        {title}
                    </div>
                );
            },
        },
        {
            title: 'Ngày tạo/Cập nhật',
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
                    <Tooltip title="Tải xuống dữ liệu">
                        <a href={data.data_url} target="_blank" rel="noreferrer" className="ml-2">
                            <Button type="primary" size="small" className="box-center">
                                <IconDownload size={18} />
                            </Button>
                        </a>
                    </Tooltip>

                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyOrderSource(data.key)}
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
                                    title: 'Đơn mã nguồn',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

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

export default OrderSource;
