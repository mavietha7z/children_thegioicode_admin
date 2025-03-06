import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Button, Switch, Tooltip, Breadcrumb, Pagination, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import UserBankDetail from './UserbankDetail';
import CreateUserBank from './CreateUserbank';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyUserbank, requestAuthGetUserbanks, requestAuthUpdateUserbank } from '~/services/bank';

function Userbank() {
    const [loading, setLoading] = useState(false);
    const [userbanks, setUserbanks] = useState([]);
    const [userbank, setUserbank] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách ngân hàng khách hàng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetUserbanks(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setUserbanks(result.data);
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

    const handleToggleStatusUserBank = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID ngân hàng khách hàng cần cập nhật',
            });
        }

        const result = await requestAuthUpdateUserbank(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneUserbanks = [...userbanks];

            const userbankIndex = cloneUserbanks.findIndex((userbank) => userbank.key === id);
            if (userbankIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID ngân hàng khách hàng trong danh sách',
                });
            }

            cloneUserbanks[userbankIndex].status = !cloneUserbanks[userbankIndex].status;
            setUserbanks(cloneUserbanks);

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

    const confirmDestroyUserBank = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID ngân hàng khách hàng cần xoá',
            });
        }

        const result = await requestAuthDestroyUserbank(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneUserbanks = [...userbanks];

            const userbankIndex = cloneUserbanks.findIndex((userbank) => userbank.key === id);
            if (userbankIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ngân hàng khách hàng trong danh sách',
                });
            }

            cloneUserbanks.splice(userbankIndex, 1);
            setUserbanks(cloneUserbanks);

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
            title: 'Ngân hàng',
            dataIndex: 'localbank',
            key: 'localbank',
            render: (localbank) => (
                <Link to={`${router.localbank}?id=${localbank._id}`} target="_blank">
                    <span>{localbank.sub_name}</span>
                    <br />
                    <span>{localbank.full_name}</span>
                </Link>
            ),
        },
        {
            title: 'Thông tin',
            key: 'info',
            render: (data) => (
                <Fragment>
                    <span>{data.account_number}</span>
                    <br />
                    <span>{data.account_holder}</span>
                </Fragment>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.status}
                    onChange={() => handleToggleStatusUserBank(data.key)}
                />
            ),
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'branch',
            key: 'branch',
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
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setUserbank(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyUserBank(data.key)}
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
                                    title: 'Ngân hàng khách hàng',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Button className="box-center w-xs-full" type="primary" onClick={() => setOpenCreate(true)}>
                            <PlusOutlined />
                            Thêm mới
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openCreate && <CreateUserBank open={openCreate} setOpen={setOpenCreate} callback={userbanks} setCallback={setUserbanks} />}
            {openUpdate && userbank && (
                <UserBankDetail
                    open={openUpdate}
                    setOpen={setOpenUpdate}
                    userbank={userbank}
                    callback={userbanks}
                    setCallback={setUserbanks}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={userbanks} pagination={false} />
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

export default Userbank;
