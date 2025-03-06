import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBuildingBank, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Card, Flex, Spin, Badge, Image, Space, Table, Button, Switch, Tooltip, Breadcrumb, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import DetailPaygate from './DetailPaygate';
import CreatePaygate from './CreatePaygate';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyPaygate, requestAuthGetPaygates, requestAuthUpdatePaygate } from '~/services/app';

function Paygate() {
    const [paygates, setPaygates] = useState([]);
    const [paygate, setPaygate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách cổng thanh toán';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetPaygates();

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPaygates(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggleStatusPaygate = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID cổng thanh toán cần cập nhật',
            });
        }

        const result = await requestAuthUpdatePaygate(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePaygates = [...paygates];

            const indexPaygate = clonePaygates.findIndex((item) => item.key === id);
            if (indexPaygate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID cổng thanh toán trong danh sách',
                });
            }

            clonePaygates[indexPaygate].status = !clonePaygates[indexPaygate].status;
            setPaygates(clonePaygates);

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

    const confirmDestroyPaygate = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID cổng thanh toán',
            });
        }

        const result = await requestAuthDestroyPaygate(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePaygates = [...paygates];

            const indexPaygate = clonePaygates.findIndex((item) => item.key === id);
            if (indexPaygate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cổng thanh toán trong danh sách',
                });
            }

            clonePaygates.splice(indexPaygate, 1);
            setPaygates(clonePaygates);

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
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'service',
            key: 'service',
            render: (service) => {
                let title = 'Trống';
                if (service === 'recharge') {
                    title = 'Nạp tiền';
                }
                if (service === 'withdrawal') {
                    title = 'Rút tiền';
                }
                return title;
            },
        },
        {
            title: 'Logo',
            dataIndex: 'logo_url',
            key: 'logo_url',
            render: (logo_url) => <Image src={logo_url} style={{ width: 40 }} alt="Logo" />,
        },
        {
            title: 'Điểm thưởng',
            dataIndex: 'bonus_point',
            key: 'bonus_point',
            render: (bonus_point) => <Fragment>{convertCurrency(bonus_point).slice(0, -1)} điểm</Fragment>,
        },
        {
            title: 'KM/VAT',
            key: 'promotion_vat_tax',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Khuyễn mãi giao dịch">
                        <span>{convertCurrency(data.promotion)}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Thuế giá trị gia tăng (VAT)">
                        <span>{data.vat_tax}%</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Min/Max - Nạp/Rút',
            key: 'payment',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Tối thiểu nạp/rút">
                        <span className="text-success">{convertCurrency(data.minimum_payment)}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Tối đa nạp/rút">
                        <span className="text-info">{convertCurrency(data.maximum_payment)}</span>
                    </Tooltip>
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
                    onChange={() => handleToggleStatusPaygate(data.key)}
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
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setPaygate(data);
                                setOpenDetail(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Tài khoản thanh toán">
                        <Link to={`${router.paygates}/options/${data.key}`}>
                            <Badge size="small" count={data.option_count}>
                                <Button className="box-center" type="primary" size="small">
                                    <IconBuildingBank size={18} />
                                </Button>
                            </Badge>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyPaygate(data.key)}
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
                        <Button size="small" className="box-center" onClick={() => navigate(router.home)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            className="flex-1"
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: 'Cổng thanh toán',
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

            {openCreate && <CreatePaygate open={openCreate} setOpen={setOpenCreate} callback={paygates} setCallback={setPaygates} />}
            {openDetail && paygate && (
                <DetailPaygate open={openDetail} setOpen={setOpenDetail} paygate={paygate} callback={paygates} setCallback={setPaygates} />
            )}

            <Card style={{ minHeight: 'calc(-144px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={paygates} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}
            </Card>
        </Space>
    );
}

export default Paygate;
