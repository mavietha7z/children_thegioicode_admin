import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Image,
    Button,
    Switch,
    Tooltip,
    Breadcrumb,
    Pagination,
    Popconfirm,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreatePlan from './CreatePlan';
import UpdatePlan from './UpdatePlan';
import IconQuestion from '~/assets/icon/IconQuestion';
import imageNotFound from '~/assets/image/image_not.jpg';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import {
    controlAuthDestroyCloudServerPlan,
    controlAuthGetCloudServerPlans,
    requestAuthUpdateCloudServerPlan,
} from '~/services/cloudServer';

function Plans() {
    const [plan, setPlan] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách cấu hình';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerPlans(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setPlans(result.data);
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

    const handleToggleStatusPlan = async (id, type) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID máy chủ cần cập nhật',
            });
        }

        const result = await requestAuthUpdateCloudServerPlan(id, type, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePlans = [...plans];

            const planIndex = clonePlans.findIndex((plan) => plan.key === id);
            if (planIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy máy chủ trong danh sách',
                });
            }

            clonePlans[planIndex].status = !clonePlans[planIndex].status;
            setPlans(clonePlans);

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

    const confirmDestroyServerPlan = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID máy chủ cần cập nhật',
            });
        }

        const result = await controlAuthDestroyCloudServerPlan(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePlans = [...plans];

            const planIndex = clonePlans.findIndex((plan) => plan.key === id);
            if (planIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy máy chủ trong danh sách',
                });
            }

            clonePlans.splice(planIndex, 1);
            setPlans(clonePlans);

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
            title: 'Tên máy chủ',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (image_url) => <Image width={40} src={image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />,
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
                    onChange={() => handleToggleStatusPlan(data.key, 'status')}
                />
            ),
        },
        {
            title: 'Ngày tạo/cập nhật cuối',
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
                                setPlan(data);
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
                            onConfirm={() => confirmDestroyServerPlan(data.key)}
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
                                    title: 'Danh sách cấu hình',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Row style={{ margin: '0 -4px', rowGap: 8 }}>
                            <Col xs={24} md={16} className="mt-xs-2" style={{ padding: '0 4px' }}>
                                <Input prefix={<SearchOutlined />} style={{ width: 260 }} placeholder="Tìm kiếm" />
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

            {openCreate && <CreatePlan open={openCreate} setOpen={setOpenCreate} callback={plans} setCallback={setPlans} />}
            {openUpdate && plan && (
                <UpdatePlan open={openUpdate} setOpen={setOpenUpdate} plan={plan} callback={plans} setCallback={setPlans} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={plans} pagination={false} />
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

export default Plans;
