import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconCopy, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Flex, Spin, Space, Table, Button, Tooltip, Breadcrumb, Pagination, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { generateCateString, serviceCopyKeyBoard } from '~/configs';
import { requestAuthDestroyTokenUser, requestAuthGetTokenUsers } from '~/services/module';

const calculateExpirationTime = (expiredAt) => {
    const now = moment();
    const expirationTime = moment(expiredAt);
    const duration = moment.duration(expirationTime.diff(now));

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return `Còn ${hours}:${minutes}:${seconds}`;
};

function Token() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách mã xác minh';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetTokenUsers(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setTokens(result.data);
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
    }, []);

    const confirmDestroyTokenUser = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID mã xác minh cần xoá',
            });
        }
        const result = await requestAuthDestroyTokenUser(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneTokens = [...tokens];

            const indexToken = cloneTokens.findIndex((item) => item.key === id);
            if (indexToken === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã xác minh trong danh sách',
                });
            }

            cloneTokens.splice(indexToken, 1);
            setTokens(cloneTokens);

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
            title: 'Mô-đun',
            dataIndex: 'modun',
            key: 'modun',
            render: (modun) => {
                if (modun === 'login') {
                    return 'Đăng nhập';
                }
                if (modun === 'verify') {
                    return 'Xác minh';
                }
                if (modun === 'reset') {
                    return 'Khôi phục';
                }
            },
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'service',
            key: 'service',
            render: (service) => {
                if (!service) {
                    return 'Trống';
                }
                return service;
            },
        },
        {
            title: 'Loại mã hoá',
            dataIndex: 'encrypt',
            key: 'encrypt',
        },
        {
            title: 'TOKEN',
            dataIndex: 'token',
            key: 'token',
            render: (token) => (
                <Flex align="center">
                    <span className="mr-1">{generateCateString(token, 30)}</span>
                    <Tooltip title="Sao chép">
                        <IconCopy className="cursor-pointer" size={18} stroke={1.5} onClick={() => serviceCopyKeyBoard(token)} />
                    </Tooltip>
                </Flex>
            ),
        },
        {
            title: 'Ngày tạo/Hết hạn',
            key: 'date',
            render: (date) => (
                <Fragment>
                    <span>{moment(date.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    <span>{moment(date.expired_at).format('DD/MM/YYYY HH:mm:ss')} </span>
                    <br />
                    <span className="text-danger">( {calculateExpirationTime(date.expired_at)} )</span>
                </Fragment>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Tooltip title="Xoá">
                    <Popconfirm
                        title="Delete?"
                        description={`#${data.id}`}
                        onConfirm={() => confirmDestroyTokenUser(data.key)}
                        okText="Xoá"
                        cancelText="Huỷ"
                        icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                    >
                        <Button danger type="primary" size="small" className="box-center">
                            <IconTrash size={18} />
                        </Button>
                    </Popconfirm>
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
                                    title: 'Danh sách mã xác minh',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={tokens} pagination={false} />
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

export default Token;
