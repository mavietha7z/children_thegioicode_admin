import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, Flex, Spin, Space, Table, Button, Switch, Tooltip, Popconfirm, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import CreateOption from './CreateOption';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyOptionPaygate, requestAuthGetOptionsPaygates, requestAuthUpdateOptionPaygate } from '~/services/app';

function Options() {
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetOptionsPaygates(id);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setTitle(result.title);
                setOptions(result.data);

                document.title = `Quản trị website - ${result.title}`;
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleToggleStatusOptionPaygate = async (userbank_id) => {
        if (!userbank_id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID tài khoản thanh toán',
            });
        }

        const data = {
            userbank_id,
            paygate_id: id,
        };

        const result = await requestAuthUpdateOptionPaygate(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOptions = [...options];

            const indexOption = cloneOptions.findIndex((option) => option.key === userbank_id);
            if (indexOption === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy tài khoản thanh toán trong danh sách',
                });
            }

            cloneOptions[indexOption].status = !cloneOptions[indexOption].status;
            setOptions(cloneOptions);

            notification.success({
                message: 'Thông báo',
                description: 'Bật/Tắt trạng thái tài khoản thanh toán thành công',
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const confirmDestroyOptionPaygate = async (userbank_id) => {
        if (!userbank_id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID tài khoản thanh toán',
            });
        }

        const data = {
            userbank_id,
            paygate_id: id,
        };

        const result = await requestAuthDestroyOptionPaygate(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOptions = [...options];

            const indexOption = cloneOptions.findIndex((option) => option.key === userbank_id);
            if (indexOption === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy tài khoản thanh toán trong danh sách',
                });
            }

            cloneOptions.splice(indexOption, 1);
            setOptions(cloneOptions);

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
            title: 'Chủ tài khoản',
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
                    onClick={() => handleToggleStatusOptionPaygate(data.key)}
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
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyOptionPaygate(data.key)}
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
                    <Flex className="gap-2 responsive-item">
                        <Button size="small" className="box-center" onClick={() => navigate(router.paygates)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            className="flex-1"
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: <Link to={router.paygates}>Cổng thanh toán</Link>,
                                },
                                {
                                    title,
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

            {openCreate && (
                <CreateOption open={openCreate} setOpen={setOpenCreate} paygateId={id} callback={options} setCallback={setOptions} />
            )}

            <Card style={{ minHeight: 'calc(-144px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={options} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}
            </Card>
        </Space>
    );
}

export default Options;
