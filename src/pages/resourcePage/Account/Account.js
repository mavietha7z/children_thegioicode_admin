import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Button,
    Switch,
    Tooltip,
    Pagination,
    Popconfirm,
    Breadcrumb,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreateAccount from './CreateAccount';
import UpdateAccount from './UpdateAccount';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateResourceAccount, requestAuthDestroyResourceAccount, requestAuthGetResourceAccounts } from '~/services/resource';

function Account() {
    const [account, setAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách tài khoản';

        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetResourceAccounts(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setAccounts(result.data);
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

    const handleToggleStatusAccount = async (id, type) => {
        if (!id) {
            return notification.error({ message: 'Thông báo', description: 'Không lấy được ID danh mục' });
        }

        const result = await requestAuthUpdateResourceAccount(id, type, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneAccounts = [...accounts];

            const accountIndex = cloneAccounts.findIndex((account) => account.key === id);
            if (accountIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneAccounts[accountIndex].status = !cloneAccounts[accountIndex].status;
            setAccounts(cloneAccounts);

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

    const confirmDestroyAccount = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID danh mục cần xoá',
            });
        }
        const result = await requestAuthDestroyResourceAccount(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneAccounts = [...accounts];

            const accountIndex = cloneAccounts.findIndex((account) => account.key === id);
            if (accountIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneAccounts.splice(accountIndex, 1);
            setAccounts(cloneAccounts);

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
            title: 'Loại',
            dataIndex: 'product',
            key: 'product',
            render: (product) => (
                <Link to={`${router.resources_products}?id=${product._id}`} target="_blank">
                    <span>#{product.id}</span>
                    <br />
                    <span>{product.title}</span>
                </Link>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.status}
                    onChange={() => handleToggleStatusAccount(data.key, 'status')}
                />
            ),
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
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            className="box-center"
                            onClick={() => {
                                setOpenUpdate(true);
                                setAccount(data);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyAccount(data.key)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            className="box-center"
                            icon={<IconQuestion width={14} height={14} className="mt-1 mr-1" style={{ color: '#ff4d4f' }} />}
                        >
                            <Button danger type="primary" size="small">
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
                                    title: 'Tài khoản',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Row style={{ margin: '0 -4px', rowGap: 8 }}>
                            <Col xs={24} md={16} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Input prefix={<SearchOutlined />} style={{ width: 250 }} className="w-xs-full" placeholder="Tìm kiếm" />
                            </Col>
                            <Col xs={24} md={6} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Button className="box-center w-xs-full" type="primary" onClick={() => setOpenCreate(true)}>
                                    <PlusOutlined />
                                    Thêm mới
                                </Button>
                            </Col>
                        </Row>
                    </Flex>
                </Flex>
            </Card>

            {openCreate && <CreateAccount open={openCreate} setOpen={setOpenCreate} callback={accounts} setCallback={setAccounts} />}
            {openUpdate && account && (
                <UpdateAccount open={openUpdate} setOpen={setOpenUpdate} account={account} callback={accounts} setCallback={setAccounts} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={accounts} pagination={false} />
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

export default Account;
