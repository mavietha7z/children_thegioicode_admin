import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconRotate, IconServer } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Image, Badge, Button, Switch, Tooltip, Breadcrumb, Pagination, notification } from 'antd';

import router from '~/configs/routes';
import UpdateRegion from './UpdateRegion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import {
    controlAuthGetCloudServerRegion,
    requestAuthAsyncCloudServerRegion,
    requestAuthUpdateCloudServerRegion,
} from '~/services/cloudServer';
import RegionPlans from './RegionPlans';

function Regions() {
    const [plans, setPlans] = useState([]);
    const [regions, setRegions] = useState([]);
    const [region, setRegion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openPlan, setOpenPlan] = useState(false);
    const [regionPlan, setRegionPlan] = useState(null);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [loadingAsync, setLoadingAsync] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách khu vực máy chủ';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerRegion(page, id);

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setRegions(result.data);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        };
        fetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, id]);

    const handleToggleStatusRegion = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID khu vực cần cập nhật',
            });
        }

        const result = await requestAuthUpdateCloudServerRegion(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneRegions = [...regions];

            const regionIndex = cloneRegions.findIndex((region) => region.key === id);
            if (regionIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy khu vực trong danh sách',
                });
            }

            cloneRegions[regionIndex].status = !cloneRegions[regionIndex].status;
            setRegions(cloneRegions);

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

    const handleAsyncRegions = async () => {
        setLoadingAsync(true);
        const result = await requestAuthAsyncCloudServerRegion();

        setLoadingAsync(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const getRegions = await controlAuthGetCloudServerRegion(page, id);

            setLoading(false);
            if (getRegions.status === 401 || getRegions.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (getRegions?.status === 200) {
                setPages(getRegions.pages);
                setRegions(getRegions.data);

                notification.success({
                    message: 'Thông báo',
                    description: result.message,
                });
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: getRegions?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
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
            title: 'Tên khu vực',
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
                    onChange={() => handleToggleStatusRegion(data.key)}
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
                                setRegion(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xem plans">
                        <Badge count={data.plans.length}>
                            <Button
                                className="box-center"
                                type="primary"
                                size="small"
                                onClick={() => {
                                    setRegionPlan(data);
                                    setPlans(data.plans);
                                    setOpenPlan(true);
                                }}
                            >
                                <IconServer size={18} />
                            </Button>
                        </Badge>
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
                                    title: 'Danh sách khu vực',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Button
                            className="box-center w-xs-full gap-1"
                            type="primary"
                            onClick={handleAsyncRegions}
                            disabled={loadingAsync}
                            loading={loadingAsync}
                        >
                            <IconRotate size={16} />
                            Đồng bộ
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openPlan && regionPlan && <RegionPlans open={openPlan} setOpen={setOpenPlan} plans={plans} />}
            {openUpdate && region && (
                <UpdateRegion open={openUpdate} setOpen={setOpenUpdate} region={region} callback={regions} setCallback={setRegions} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={regions} pagination={false} />
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

export default Regions;
