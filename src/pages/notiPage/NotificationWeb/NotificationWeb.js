import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconChecks, IconFileDescription, IconTrash, IconX } from '@tabler/icons-react';
import { Breadcrumb, Button, Card, Flex, notification, Pagination, Popconfirm, Space, Spin, Table, Tag, Tooltip } from 'antd';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyNotification, requestAuthGetNotifications } from '~/services/notification';

function NotificationWeb() {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách thông báo website';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetNotifications('Web', page);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setNotifications(result.data);
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

    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const onExpand = (record) => {
        const keys = expandedRowKeys.includes(record.key)
            ? expandedRowKeys.filter((k) => k !== record.key)
            : [...expandedRowKeys, record.key];
        setExpandedRowKeys(keys);
    };

    const defaultExpandable = {
        expandedRowRender: (record) => <p>{record.content}</p>,
        expandedRowKeys,
        onExpand: (_, record) => onExpand(record),
        expandIcon: () => null,
    };

    const confirmDestroyNotification = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID thông báo cần xoá',
            });
        }

        const result = await requestAuthDestroyNotification(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneNotifications = [...notifications];

            const indexNotification = cloneNotifications.findIndex((item) => item.key === id);
            if (indexNotification === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy thông báo trong danh sách',
                });
            }

            cloneNotifications.splice(indexNotification, 1);
            setNotifications(cloneNotifications);

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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return <Tag color="green">{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Đã đọc?',
            dataIndex: 'unread',
            key: 'unread',
            render: (unread) => (
                <Fragment>
                    {unread ? (
                        <Tooltip title="Chưa đọc">
                            <IconX className="text-danger" size={16} />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Đã đọc">
                            <IconChecks className="text-success" size={16} />
                        </Tooltip>
                    )}
                </Fragment>
            ),
        },
        {
            title: 'Ngày tạo/Ngày gửi',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    {data.sent_at ? <span>{moment(data.sent_at).format('DD/MM/YYYY HH:mm:ss')}</span> : 'Chưa gửi'}
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data, record) => (
                <Flex align="center" gap={12}>
                    <Tooltip title="Xem nội dung">
                        <Button size="small" className="box-center" type="primary" onClick={() => record.onExpand(record)}>
                            <IconFileDescription size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyNotification(data.key)}
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
                                    title: 'Thông báo website',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table
                        columns={columns}
                        pagination={false}
                        expandable={defaultExpandable}
                        dataSource={notifications.map((notification) => ({ ...notification, onExpand }))}
                    />
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

export default NotificationWeb;
