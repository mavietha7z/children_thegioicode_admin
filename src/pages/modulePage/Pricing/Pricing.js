import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import {
    Col,
    Row,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Button,
    Switch,
    Tooltip,
    Breadcrumb,
    Pagination,
    Popconfirm,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreatePricing from './CreatePricing';
import UpdatePricing from './UpdatePricing';
import { convertCurrency } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthDestroyPricing, requestAuthGetPricing, requestAuthUpdatePricing } from '~/services/module';

function Pricing() {
    const [pricings, setPricings] = useState([]);
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');
    const service_id = searchParams.get('service_id');

    useEffect(() => {
        document.title = 'Quản trị website - Giá cả sản phẩm';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetPricing(page, id, service_id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setPricings(result.data);
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
    }, [page, id, service_id]);

    const handleToggleStatusPricing = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID giá cả cần sửa',
            });
        }

        const result = await requestAuthUpdatePricing('status', id, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePricings = [...pricings];

            const indexPricing = clonePricings.findIndex((pricing) => pricing.key === id);
            if (indexPricing === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy giá cả trong danh sách',
                });
            }

            clonePricings[indexPricing].status = !clonePricings[indexPricing].status;
            setPricings(clonePricings);

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

    const confirmDestroyPricing = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID giá cả cần xoá',
            });
        }
        const result = await requestAuthDestroyPricing(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePricings = [...pricings];

            const indexPricing = clonePricings.findIndex((item) => item.key === id);
            if (indexPricing === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy giá cả trong danh sách',
                });
            }

            clonePricings.splice(indexPricing, 1);
            setPricings(clonePricings);

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
            title: 'Dịch vụ',
            key: 'service',
            render: (data) => {
                let routerPath = '';
                if (data.service_type === 'Source') {
                    routerPath = router.sources_published;
                }
                if (data.service_type === 'Template') {
                    routerPath = router.templates;
                }
                if (data.service_type === 'CloudServerProduct') {
                    routerPath = router.cloud_server_product;
                }

                return (
                    <Link to={`${routerPath}?id=${data.service._id}`} target="_blank">
                        <Tooltip title={data.service.title}>
                            <span>#{data.service.id}</span>
                            <br />
                            <span>{data.service.title}</span>
                        </Tooltip>
                    </Link>
                );
            },
        },
        {
            title: 'Loại dịch vụ',
            dataIndex: 'service_type',
            key: 'service_type',
            render: (service_type) => {
                if (service_type === 'Template') {
                    return 'Template';
                }

                if (service_type === 'Source') {
                    return 'Mã nguồn';
                }

                return service_type;
            },
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycles',
            key: 'cycles',
            render: (cycles) => (
                <Link to={`${router.cycles}?id=${cycles._id}`} target="_blank">
                    <span>{cycles.display_name}</span>
                </Link>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            render: (data) => {
                return (
                    <Fragment>
                        <span className="text-success">{convertCurrency(data.price)}</span>
                        <br />
                        <span className="text-danger">{data.discount}%</span>
                        <br />
                        <span className="text-info">{convertCurrency(data.price * (1 - data.discount / 100))}</span>
                    </Fragment>
                );
            },
        },
        {
            title: 'Điểm thưởng',
            dataIndex: 'bonus_point',
            key: 'bonus_point',
            render: (bonus_point) => <Fragment>{convertCurrency(bonus_point).slice(0, -1)} điểm</Fragment>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    defaultChecked
                    value={data.status}
                    onChange={() => handleToggleStatusPricing(data.key)}
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
                                setPricing(data);
                                setOpenDetail(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyPricing(data.key)}
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
                                    title: 'Giá cả sản phẩm',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Row style={{ margin: '0 -4px', rowGap: 8 }}>
                            <Col xs={24} md={16} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Input prefix={<SearchOutlined />} placeholder="Tìm kiếm" style={{ width: 260 }} className="mx-3" />
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

            {openCreate && <CreatePricing open={openCreate} setOpen={setOpenCreate} callback={pricings} setCallback={setPricings} />}
            {openDetail && pricing && (
                <UpdatePricing open={openDetail} setOpen={setOpenDetail} pricing={pricing} callback={pricings} setCallback={setPricings} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={pricings} pagination={false} />
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

export default Pricing;
