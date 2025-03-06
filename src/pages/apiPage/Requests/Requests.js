import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconInfoCircleFilled } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Tag, Card, Flex, Spin, Space, Table, Button, Pagination, Tooltip, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import DetailRequest from './DetailRequest';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetRequestsApi } from '~/services/api';

function Requests() {
    const [open, setOpen] = useState(false);
    const [service, setService] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách yêu cầu';

        if (id) {
            const fetch = async () => {
                setLoading(true);
                const result = await requestAuthGetRequestsApi(page, id);

                setLoading(false);
                if (result.status === 401 || result.status === 403) {
                    dispatch(logoutAuthSuccess());
                    navigate(`${router.login}?redirect_url=${pathname}`);
                } else if (result?.status === 200) {
                    setPages(result.pages);
                    setRequests(result.data);
                    setService(result.service);
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                    });
                }
            };
            fetch();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Link to={`${router.users}?id=${user._id}`} target="_blank">
                    <span> {user.full_name}</span>
                    <br />
                    <span> {user.email}</span>
                </Link>
            ),
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            render: (method) => {
                let color = '#52c41a';
                if (method === 'GET') {
                    color = '#55acee';
                }
                if (method === 'DELETE') {
                    color = '#ff4d4f';
                }
                if (method === 'PUT') {
                    color = '#FF8633';
                }
                return <Tag color={color}>{method}</Tag>;
            },
        },
        {
            title: 'Path',
            dataIndex: 'path',
            key: 'path',
            render: (path) => <Tag color="#6c757d">{path}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '#52c41a';
                if (status !== 200) {
                    color = '#ff4d4f';
                }
                return <span style={{ color }}>{status}</span>;
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
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            className="box-center"
                            onClick={() => {
                                setOpen(true);
                                setRequestId(data.key);
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
                        <Button size="small" className="box-center" onClick={() => navigate(router.apis)}>
                            <IconArrowLeft stroke={2} size={18} />
                        </Button>
                        <Breadcrumb
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: <Link to={router.apis}>Apis</Link>,
                                },
                                {
                                    title: service,
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            {open && <DetailRequest open={open} setOpen={setOpen} requestId={requestId} />}

            <Card style={{ minHeight: 'calc(-180px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={requests} pagination={false} />
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

export default Requests;
