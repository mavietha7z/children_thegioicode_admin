import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconInfoCircleFilled, IconRotate, IconTrash } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Flex, Spin, Space, Image, Table, Button, Switch, Tooltip, Breadcrumb, Pagination, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import UpdateImage from './UpdateImage';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import {
    controlAuthGetCloudServerImages,
    requestAuthAsyncCloudServerImage,
    requestAuthUpdateCloudServerImage,
    controlAuthDestroyCloudServerImage,
} from '~/services/cloudServer';

function Images() {
    const [images, setImages] = useState([]);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [loadingAsync, setLoadingAsync] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách hệ điều hành';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerImages(page);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setImages(result.data);
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

    const handleToggleStatusImage = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID hệ điều hành cần cập nhật',
            });
        }

        const result = await requestAuthUpdateCloudServerImage(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneRegions = [...images];

            const regionIndex = cloneRegions.findIndex((region) => region.key === id);
            if (regionIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy hệ điều hành trong danh sách',
                });
            }

            cloneRegions[regionIndex].status = !cloneRegions[regionIndex].status;
            setImages(cloneRegions);

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

    const handleAsyncImages = async () => {
        setLoadingAsync(true);
        const result = await requestAuthAsyncCloudServerImage();

        setLoadingAsync(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const getImages = await controlAuthGetCloudServerImages(page);

            setLoading(false);
            if (getImages.status === 401 || getImages.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (getImages?.status === 200) {
                setPages(getImages.pages);
                setImages(getImages.data);

                notification.success({
                    message: 'Thông báo',
                    description: result.message,
                });
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: getImages?.error || 'Lỗi hệ thống vui lòng thử lại sau',
                });
            }
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const confirmDestroyServerImage = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID hệ điều hành',
            });
        }

        const result = await controlAuthDestroyCloudServerImage(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneImages = [...images];

            const imageIndex = cloneImages.findIndex((image) => image.key === id);
            if (imageIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy hệ điều hành trong danh sách',
                });
            }

            cloneImages.splice(imageIndex, 1);
            setImages(cloneImages);

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
            title: 'Nhóm',
            dataIndex: 'group',
            key: 'group',
        },
        {
            title: 'Tên',
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
                    onChange={() => handleToggleStatusImage(data.key)}
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
                                setImage(data);
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
                            onConfirm={() => confirmDestroyServerImage(data.key)}
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
                                    title: 'Hệ điều hành',
                                },
                            ]}
                        />
                    </Flex>

                    <Flex justify="end" className="responsive-item">
                        <Button
                            className="box-center w-xs-full gap-1"
                            type="primary"
                            onClick={handleAsyncImages}
                            disabled={loadingAsync}
                            loading={loadingAsync}
                        >
                            <IconRotate size={16} />
                            Đồng bộ
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            {openUpdate && image && (
                <UpdateImage open={openUpdate} setOpen={setOpenUpdate} image={image} callback={images} setCallback={setImages} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={images} pagination={false} />
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

export default Images;
