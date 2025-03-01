import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ExclamationCircleFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { IconTrash, IconLogin2, IconArrowLeft, IconInfoCircleFilled, IconCoin, IconLogout } from '@tabler/icons-react';
import {
    Tag,
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Modal,
    Button,
    Tooltip,
    Popconfirm,
    Pagination,
    Breadcrumb,
    notification,
} from 'antd';

import { baseURL } from '~/utils';
import UpdateUser from './UpdateUser';
import router from '~/configs/routes';
import RegisterUser from './RegisterUser';
import { convertCurrency } from '~/configs';
import useDebounce from '~/hooks/useDebounce';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyUser, requestAuthGetUsers, requestAuthLogoutAllUsers, requestAuthSearchUser } from '~/services/account';

const { confirm } = Modal;

function Users() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');
    const debounce = useDebounce(searchValue, 800);

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách người dùng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetUsers(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setUsers(result.data);
                setPages(result.pages);
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
            const result = await requestAuthSearchUser(debounce);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(1);
                setUsers(result.data);
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

    const showConfirmLogoutAllUsers = () => {
        confirm({
            title: <div className="font-size-16">Chắc chắn muốn đăng xuất tất cả?</div>,
            icon: <ExclamationCircleFilled />,
            content: 'Hành động này sẽ khiến tất cả tài khoản của khách hàng bị đăng xuất và không thể hoàn tác!',
            onOk() {
                handleLogoutAllUsers();
            },
            okText: 'Xác nhận',
            cancelText: 'Hủy',
        });
    };

    // Login user
    const handleLoginUser = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID người dùng cần đăng nhập',
            });
        }

        window.open(`${baseURL}/manages/users/login?id=${id}`);
    };

    const handleLogoutAllUsers = async () => {
        const result = await requestAuthLogoutAllUsers();

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

    // Destroy user
    const confirmDestroyUser = async (id) => {
        if (!id) {
            notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID người dùng cần xoá',
            });
        }

        const result = await requestAuthDestroyUser(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneUsers = [...users];

            const indexUser = cloneUsers.findIndex((user) => user.key === id);
            if (indexUser === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy người dùng trong danh sách',
                });
            }

            cloneUsers.splice(indexUser, 1);
            setUsers(cloneUsers);

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
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Thông tin',
            key: 'info',
            render: (data) => (
                <Fragment>
                    <span>{data.username}</span>
                    <br />
                    <span>{data.email}</span>
                    <br />
                    <span>{data.phone_number}</span>
                </Fragment>
            ),
        },
        {
            title: 'Ví',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (wallet) => (
                <Fragment>
                    ID:
                    <Link to={`${router.wallets}?id=${wallet._id}`} target="_blank">
                        <span> {wallet.id}</span>
                    </Link>
                    <br />
                    <b>{convertCurrency(wallet.total_balance)}</b>
                </Fragment>
            ),
        },
        {
            title: 'Bậc',
            dataIndex: 'membership',
            key: 'membership',
            render: (membership) => {
                return (
                    <Fragment>
                        <Tooltip title="Bậc hiện tại">
                            <Link to={`${router.memberships}?id=${membership.current._id}`} target="_blank">
                                <b className="text-success">{membership.current.name.toUpperCase()}</b>
                            </Link>
                        </Tooltip>
                        <br />

                        <Tooltip title="Bậc tiếp theo sẽ đạt được">
                            <Link to={`${router.memberships}?id=${membership.next_membership._id}`} target="_blank">
                                <b className="text-info">{membership.next_membership.name.toUpperCase()}</b>
                            </Link>
                        </Tooltip>
                    </Fragment>
                );
            },
        },
        {
            title: 'Đăng ký',
            dataIndex: 'register_type',
            key: 'register_type',
            render: (register_type) => {
                let color = '#40bc86';
                if (register_type === 'google') {
                    color = '#1890ff';
                }
                if (register_type === 'facebook') {
                    color = '#4267b2';
                }
                if (register_type === 'github') {
                    color = '#a5a8ab';
                }

                return <Tag color={color}>{register_type.toUpperCase()}</Tag>;
            },
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
                if (status === 'blocked') {
                    color = '#ff4d4f';
                    message = 'Bị khóa';
                }
                return <Tag color={color}>{message.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Ngày tạo/Đăng nhập',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Thời gian đăng ký tài khoản">
                        <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Thời gian đăng nhập cuối cùng">
                        {data.last_login_at ? <span>{moment(data.last_login_at).format('DD/MM/YYYY HH:mm:ss')}</span> : 'Chưa đăng nhập'}
                    </Tooltip>
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
                                setUser(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Đăng nhập tài khoản">
                        <Button className="box-center" type="primary" size="small" onClick={() => handleLoginUser(data.key)}>
                            <IconLogin2 size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Nạp/rút">
                        <Link to={`${router.wallets}?id=${data.wallet._id}`}>
                            <Button className="box-center" type="primary" size="small">
                                <IconCoin size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={data.full_name}
                            onConfirm={() => confirmDestroyUser(data.key)}
                            okText="Xoá"
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
                                    title: 'Danh sách người dùng',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Row>
                            <Col xs={24} md={6} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Button
                                    type="primary"
                                    className="box-center w-xs-full"
                                    style={{ background: '#FF0000' }}
                                    onClick={showConfirmLogoutAllUsers}
                                >
                                    <IconLogout size={20} />
                                    <span style={{ marginLeft: 6 }}>Logout tất cả</span>
                                </Button>
                            </Col>
                            <Col xs={24} md={12} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Input
                                    prefix={<SearchOutlined />}
                                    placeholder="Tìm kiếm"
                                    value={searchValue}
                                    style={{ width: 260 }}
                                    className="mx-3 w-xs-full"
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </Col>
                            <Col xs={24} md={6} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Button
                                    style={{ display: 'flex', alignItems: 'center' }}
                                    type="primary"
                                    className="w-xs-full box-center"
                                    onClick={() => setOpenRegister(true)}
                                >
                                    <PlusOutlined />
                                    Thêm mới
                                </Button>
                            </Col>
                        </Row>
                    </Flex>
                </Flex>
            </Card>

            {openRegister && <RegisterUser open={openRegister} setOpen={setOpenRegister} callback={users} setCallback={setUsers} />}
            {openUpdate && user && (
                <UpdateUser open={openUpdate} setOpen={setOpenUpdate} user={user} callback={users} setCallback={setUsers} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={users} pagination={false} />
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

export default Users;
