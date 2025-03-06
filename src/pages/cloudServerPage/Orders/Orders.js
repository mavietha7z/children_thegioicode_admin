import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconRotate, IconArrowLeft, IconInfoCircleFilled } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Image, Button, Switch, Tooltip, Breadcrumb, Pagination, notification } from 'antd';

import router from '~/configs/routes';
import OrderDetail from './OrderDetail';
import { calculateDaysLeft } from '~/configs';
import IconLoading from '~/assets/icon/IconLoading';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { controlAuthGetCloudServerOrder, requestAuthAsyncCloudServerOrder } from '~/services/cloudServer';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [loadingAsync, setLoadingAsync] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách đơn đặt máy chủ';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerOrder(page);

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

    const handleAsyncOrders = async () => {
        setLoadingAsync(true);
        const result = await requestAuthAsyncCloudServerOrder();

        setLoadingAsync(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const getRegions = await controlAuthGetCloudServerOrder(page);

            setLoading(false);
            if (getRegions.status === 401 || getRegions.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (getRegions?.status === 200) {
                setPages(getRegions.pages);
                setOrders(getRegions.data);

                notification.success({
                    message: 'Thông báo',
                    description: result.message,
                });
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: getRegions?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
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
            title: 'Tên hiển thị',
            dataIndex: 'display_name',
            key: 'display_name',
        },
        {
            title: 'Máy chủ',
            key: 'region',
            render: (data) => (
                <Fragment>
                    <span>{data.plan.title}</span>
                    <br />
                    <span>{data.region.title}</span>
                </Fragment>
            ),
        },
        {
            title: 'Cấu hình',
            dataIndex: 'product',
            key: 'product',
            render: (product) => (
                <Fragment>
                    <span>{product.core} vCPU</span>
                    <br />
                    <span>{product.memory / 1024} GB RAM</span>
                    <br />
                    <span>{product.disk} GB SSD</span>
                </Fragment>
            ),
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <Fragment>
                    <Image width={40} src={image.image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />
                    <div>{image.title}</div>
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

                if (status === 'activated') {
                    className = 'label-light-success font-weight-bold';
                    style = { backgroundColor: '#4caf501a', color: '#4caf50', border: '1px solid #4caf501a' };
                }
                if (['starting', 'restarting', 'stopping', 'rebuilding', 'resizing'].includes(status)) {
                    className = 'label-light-warning font-weight-bold';
                    style = { backgroundColor: '#ff98001a', color: '#ff9800', border: '1px solid #ff98001a' };
                }
                if (['stopped', 'suspended', 'expired', 'deleted'].includes(status)) {
                    className = 'label-light-danger font-weight-bold';
                    style = { backgroundColor: '#f443361a', color: '#f44336', border: '1px solid #f443361a' };
                }

                return (
                    <Fragment>
                        {['starting', 'restarting', 'stopping', 'rebuilding', 'resizing'].includes(status) ? (
                            <Flex align="center">
                                <div className={className} style={style}>
                                    {status.toUpperCase()}
                                </div>
                                <IconLoading />
                            </Flex>
                        ) : (
                            <div className={className} style={style}>
                                {status.toUpperCase()}
                            </div>
                        )}
                    </Fragment>
                );
            },
        },
        {
            title: 'Auto renew',
            dataIndex: 'auto_renew',
            key: 'auto_renew',
            render: (auto_renew) => <Switch checkedChildren="Bật" unCheckedChildren="Tắt" value={auto_renew} disabled />,
        },
        {
            title: 'Backup',
            dataIndex: 'backup_server',
            key: 'backup_server',
            render: (backup_server) => <Switch checkedChildren="Bật" unCheckedChildren="Tắt" value={backup_server} disabled />,
        },
        {
            title: 'Thời gian',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Ngày đăng ký">
                        <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Ngày hết hạn">
                        <span>{moment(data.expired_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Fragment>
                        (
                        <b className={moment(data.expired_at).diff(new Date(), 'days') < 8 ? 'text-danger' : ''}>
                            {calculateDaysLeft(data.expired_at)}
                        </b>
                        )
                    </Fragment>
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setOrder(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
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
                                    title: 'Danh sách đơn đặt máy chủ',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Button
                            className="box-center w-xs-full gap-1"
                            type="primary"
                            onClick={handleAsyncOrders}
                            disabled={loadingAsync}
                            loading={loadingAsync}
                        >
                            <IconRotate size={16} />
                            Đồng bộ
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openUpdate && order && <OrderDetail open={openUpdate} setOpen={setOpenUpdate} order={order} />}

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
