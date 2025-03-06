import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconCancel, IconCheck, IconInfoCircleFilled, IconLock, IconPassword, IconTrash } from '@tabler/icons-react';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Form,
    Space,
    Modal,
    Table,
    Input,
    Image,
    Button,
    Switch,
    Tooltip,
    Breadcrumb,
    Pagination,
    Popconfirm,
    notification,
} from 'antd';

import router from '~/configs/routes';
import OrderDetail from './OrderDetail';
import CreateOrder from './CreateOrder';
import { calculateDaysLeft } from '~/configs';
import IconLoading from '~/assets/icon/IconLoading';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import {
    controlAuthGetCloudServerOrder,
    controlAuthDestroyCloudServerOrder,
    requestAuthChangePasswordCloudServerOrder,
} from '~/services/cloudServer';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const [form] = Form.useForm();
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

    // Đổi mật khẩu root
    const confirmChangePasswordOrderCloudServer = async (values) => {
        if (!order.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đơn cần đổi mật khẩu',
            });
        }

        const data = {
            id: order.key,
            ...values,
        };
        const result = await requestAuthChangePasswordCloudServerOrder(data);

        setOrder(null);
        setModalVisible(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
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

    const confirmDestroyOrderCloudServer = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đơn cần xoá',
            });
        }
        const result = await controlAuthDestroyCloudServerOrder(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOrders = [...orders];

            const orderIndex = cloneOrders.findIndex((order) => order.key === id);
            if (orderIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đơn trong danh sách',
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
                <Image width={40} src={image.image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />
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
                    <Tooltip title="Đổi mật khẩu root">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setOrder(data);
                                setModalVisible(true);
                            }}
                        >
                            <IconPassword size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Khoá máy chủ">
                        <Button className="box-center" type="primary" size="small">
                            <IconLock size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Huỷ đơn trước hạn">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyOrderCloudServer(data.key)}
                            okText="Huỷ"
                            cancelText="Huỷ"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small" className="box-center">
                                <IconTrash size={18} />
                            </Button>
                        </Popconfirm>
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
                        <Button className="box-center w-xs-full" type="primary" onClick={() => setOpenCreate(true)}>
                            <PlusOutlined />
                            Dùng thử
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {modalVisible && (
                <Modal
                    centered
                    closable={false}
                    maskClosable={false}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    width={450}
                    title="Đổi mật khẩu máy chủ root"
                    footer={null}
                >
                    <Form layout="vertical" form={form} onFinish={confirmChangePasswordOrderCloudServer}>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="password"
                                    className="mb-3"
                                    label="Mật khẩu mới"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mật khẩu',
                                        },
                                    ]}
                                >
                                    <Input size="large" placeholder="Mật khẩu mới" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="confirm_password"
                                    className="mb-3"
                                    label="Xác nhận mật khẩu"
                                    dependencies={['password']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập mật khẩu',
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input size="large" placeholder="Xác nhận mật khẩu" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 flex-grow-1 mt-4">
                            <Button
                                icon={<IconCancel size={17} />}
                                className="min-height-35 box-center"
                                onClick={() => setModalVisible(false)}
                            >
                                Huỷ
                            </Button>
                            <Button
                                type="primary"
                                icon={<IconCheck size={17} />}
                                className="min-height-35 box-center min-width-120 flex-1"
                                htmlType="submit"
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </Form>
                </Modal>
            )}

            {openCreate && <CreateOrder open={openCreate} setOpen={setOpenCreate} callback={orders} setCallback={setOrders} />}
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
