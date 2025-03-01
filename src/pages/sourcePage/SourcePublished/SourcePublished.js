import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconCoin, IconInfoCircleFilled, IconPlus, IconTrash } from '@tabler/icons-react';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Table,
    Input,
    Badge,
    Button,
    Switch,
    Tooltip,
    Pagination,
    Popconfirm,
    Breadcrumb,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreateSource from '../CreateSource';
import SourceDetail from '../SourceDetail';
import { generateCateString } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import DrawerPricing from '~/components/DrawerPricing';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreatePricing } from '~/services/module';
import { requestAuthDestroySource, requestAuthGetSources, requestAuthUpdateSource } from '~/services/source';

function SourcePublished() {
    const [source, setSource] = useState(null);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openPricing, setOpenPricing] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách mã nguồn';

        setLoading(true);

        const fetch = async () => {
            const result = await requestAuthGetSources(page, 'published', id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setSources(result.data);
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

    const handleToggleSource = async (id, type) => {
        if (!id) {
            return notification.error({ message: 'Thông báo', description: 'Không tìm thấy ID mã nguồn' });
        }

        const result = await requestAuthUpdateSource(id, type, {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            let cloneSources = [...sources];

            const indexSource = cloneSources.findIndex((source) => source.key === id);
            if (indexSource === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID mã nguồn trong danh sách',
                });
            }

            if (type === 'published') {
                cloneSources.splice(indexSource, 1);
            }
            if (type === 'status') {
                cloneSources[indexSource].status = !cloneSources[indexSource].status;
            }

            setSources(cloneSources);

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

    const handleCreatePricing = async (values) => {
        const {
            price,
            discount,
            cycles_id,
            other_fees,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            bonus_point,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
        } = values;

        const data = {
            price,
            discount,
            cycles_id,
            other_fees,
            bonus_point,
            penalty_fee,
            renewal_fee,
            upgrade_fee,
            creation_fee,
            brokerage_fee,
            original_price,
            cancellation_fee,
            service_id: source.key,
            service_type: 'Source',
        };

        const result = await requestAuthCreatePricing(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneSources = [...sources];

            const sourceIndex = cloneSources.findIndex((sour) => sour.key === source.key);
            if (sourceIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã nguồn trong danh sách',
                });
            }

            cloneSources[sourceIndex].pricing += 1;

            setSource(null);
            setOpenPricing(false);
            setSources(cloneSources);

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

    const confirmDestroySource = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID mã nguồn cần xoá',
            });
        }
        const result = await requestAuthDestroySource(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneSources = [...sources];

            const indexSource = cloneSources.findIndex((item) => item.key === id);
            if (indexSource === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy mã nguồn trong danh sách',
                });
            }

            cloneSources.splice(indexSource, 1);
            setSources(cloneSources);

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
            title: 'Tác giả',
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
            title: 'Tên',
            dataIndex: 'title',
            key: 'title',
            render: (title) => (
                <Tooltip title={title}>
                    <Fragment>{generateCateString(title, 26)}</Fragment>
                </Tooltip>
            ),
        },
        {
            title: 'Lượt xem/mua',
            key: 'stats',
            render: (data) => (
                <Fragment>
                    <span className="text-success">{data.view_count} xem</span> /{' '}
                    <span className="text-info">{data.purchase_count} mua</span>
                </Fragment>
            ),
        },
        {
            title: 'Xuất bản',
            key: 'published',
            render: (data) => (
                <Switch
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    value={data.published}
                    onChange={() => handleToggleSource(data.key, 'published')}
                />
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
                    onChange={() => handleToggleSource(data.key, 'status')}
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
                                setSource(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Giá cả">
                        <Link to={`${router.pricing}?service_id=${data.key}`} target="_blank">
                            <Badge count={data.pricing} size="small">
                                <Button className="box-center" type="primary" size="small">
                                    <IconCoin size={18} />
                                </Button>
                            </Badge>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Thêm giá">
                        <Button
                            className="box-center"
                            type="primary"
                            size="small"
                            onClick={() => {
                                setSource(data);
                                setOpenPricing(true);
                            }}
                        >
                            <IconPlus size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroySource(data.key)}
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
                                    title: 'Danh sách mã nguồn',
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

            {openPricing && <DrawerPricing open={openPricing} setOpen={setOpenPricing} onClick={handleCreatePricing} />}
            {openCreate && <CreateSource open={openCreate} setOpen={setOpenCreate} callback={sources} setCallback={setSources} />}
            {openUpdate && source && (
                <SourceDetail open={openUpdate} setOpen={setOpenUpdate} source={source} callback={sources} setCallback={setSources} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={sources} pagination={false} />
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

export default SourcePublished;
