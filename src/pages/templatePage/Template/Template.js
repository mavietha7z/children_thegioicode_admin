import moment from 'moment';
import { useDispatch } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconCoin, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Card, Flex, Spin, Space, Table, Image, Button, Switch, Tooltip, Pagination, Popconfirm, Breadcrumb, notification } from 'antd';

import router from '~/configs/routes';
import CreateTemplate from './CreateTemplate';
import TemplateDetail from './TemplateDetail';
import { generateCateString } from '~/configs';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthDestroyTemplate, requestAuthGetTemplates, requestAuthUpdateTemplate } from '~/services/template';

function Template() {
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
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
        document.title = 'Quản trị website - Danh sách template';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetTemplates(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setTemplates(result.data);
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

    const handleToggleStatusTemplate = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID template cần cập nhật',
            });
        }

        const result = await requestAuthUpdateTemplate(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneTemplates = [...templates];

            const indexTemplate = cloneTemplates.findIndex((template) => template.key === id);
            if (indexTemplate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy template trong danh sách',
                });
            }

            cloneTemplates[indexTemplate].status = !cloneTemplates[indexTemplate].status;
            setTemplates(cloneTemplates);

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

    // Xoá
    const confirmDestroyTemplate = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID template cần xoá',
            });
        }
        const result = await requestAuthDestroyTemplate(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneTemplates = [...templates];

            const indexTemplate = cloneTemplates.findIndex((item) => item.key === id);
            if (indexTemplate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy template trong danh sách',
                });
            }

            cloneTemplates.splice(indexTemplate, 1);
            setTemplates(cloneTemplates);

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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (title) => <Tooltip title={title}>{generateCateString(title, 40)}</Tooltip>,
        },
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (image_url) => (
                <Image width={60} height={40} src={image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />
            ),
        },
        {
            title: 'Lượt xem/tạo',
            key: 'view_create',
            render: (data) => (
                <Fragment>
                    <span className="text-success">{data.view_count} xem</span> / <span className="text-info">{data.create_count} tạo</span>
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
                    defaultChecked
                    value={data.status}
                    onChange={() => handleToggleStatusTemplate(data.key)}
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
                                setTemplate(data);
                                setOpenUpdate(true);
                            }}
                        >
                            <IconInfoCircleFilled size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Giá cả">
                        <Link to={`${router.pricing}?service_id=${data.key}`} target="_blank">
                            <Button className="box-center" type="primary" size="small">
                                <IconCoin size={18} />
                            </Button>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Delete?"
                            description={`#${data.id}`}
                            onConfirm={() => confirmDestroyTemplate(data.key)}
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
                                    title: 'Danh sách template',
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

            {openCreate && <CreateTemplate open={openCreate} setOpen={setOpenCreate} callback={templates} setCallback={setTemplates} />}
            {openUpdate && template && (
                <TemplateDetail
                    open={openUpdate}
                    setOpen={setOpenUpdate}
                    template={template}
                    callback={templates}
                    setCallback={setTemplates}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={templates} pagination={false} />
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

export default Template;
