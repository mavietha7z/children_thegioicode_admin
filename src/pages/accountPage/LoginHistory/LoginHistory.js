import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { IconArrowLeft } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Space, Card, Input, Flex, Table, Tag, Pagination, Spin, Button, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import useDebounce from '~/hooks/useDebounce';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetLoginHistoriesUsers, requestAuthSearchLoginHistoriesUser } from '~/services/account';

function LoginHistory() {
    const [loading, setLoading] = useState(false);
    const [histories, setHistories] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const debounce = useDebounce(searchValue, 800);

    useEffect(() => {
        document.title = 'Quản trị website - Lịch sử đăng nhập người dùng';

        setLoading(true);
        const fetch = async () => {
            const result = await requestAuthGetLoginHistoriesUsers(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setHistories(result.data);
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

    // Search
    useEffect(() => {
        if (debounce.length < 1) {
            return;
        }

        const fetch = async () => {
            const result = await requestAuthSearchLoginHistoriesUser(page, debounce);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setHistories(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounce, page]);

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
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Fragment>
                    {role.map((tag, index) => {
                        let color = '#52c41a';
                        if (tag === 'delete') {
                            color = '#ff4d4f';
                        }
                        if (tag === 'create') {
                            color = '#1890ff';
                        }
                        if (tag === 'edit') {
                            color = '#13c2c2';
                        }
                        if (tag === 'view') {
                            color = '#2db7f5';
                        }
                        if (tag === 'admin') {
                            color = '#722ed1';
                        }
                        const classTag = index > 2 ? 'mt-2' : '';
                        return (
                            <Fragment key={index}>
                                {index % 3 === 0 && index !== 0 && <br />}
                                <Tag color={color} className={classTag}>
                                    {tag.toUpperCase()}
                                </Tag>
                            </Fragment>
                        );
                    })}
                </Fragment>
            ),
        },
        {
            title: 'IPv4/IPv6',
            dataIndex: 'ip',
            key: 'ip',
            render: (ip) => (
                <a href={`https://ipinfo.io/${ip}`} target="_blank" rel="noopener noreferrer">
                    {ip}
                </a>
            ),
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            render: (address) => <Fragment>{address ? address : 'Trống'}</Fragment>,
        },
        {
            title: 'Device',
            dataIndex: 'device',
            key: 'device',
        },
        {
            title: 'Browser',
            dataIndex: 'browser',
            key: 'browser',
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
                                    title: 'Lịch sử đăng nhập',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm kiếm"
                            value={searchValue}
                            style={{ width: 260 }}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={histories} pagination={false} style={{ overflowX: 'auto' }} />
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

export default LoginHistory;
