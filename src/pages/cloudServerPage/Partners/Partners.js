import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import { Col, Row, Card, Flex, Spin, Space, Table, Input, Button, Switch, Tooltip, Breadcrumb, Popconfirm, notification } from 'antd';

import router from '~/configs/routes';
import CreatePartner from './CreatePartner';
import UpdatePartner from './UpdatePartner';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import {
    controlAuthGetCloudServerPartner,
    requestAuthUpdateCloudServerPartner,
    requestAuthDestroyCloudServerPartner,
} from '~/services/cloudServer';

function Partners() {
    const [partners, setPartners] = useState([]);
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách đối tác';

        const fetch = async () => {
            setLoading(true);
            const result = await controlAuthGetCloudServerPartner();

            setLoading(false);
            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPartners(result.data);
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

    const handleToggleStatusPartner = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID đối tác cần sửa',
            });
        }

        const result = await requestAuthUpdateCloudServerPartner(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePartners = [...partners];

            const partnerIndex = clonePartners.findIndex((partner) => partner.key === id);
            if (partnerIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đối tác trong danh sách',
                });
            }

            clonePartners[partnerIndex].status = !clonePartners[partnerIndex].status;
            setPartners(clonePartners);

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

    const confirmDestroyServerPartner = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID đối tác',
            });
        }

        const result = await requestAuthDestroyCloudServerPartner(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePartners = [...partners];

            const partnerIndex = clonePartners.findIndex((partner) => partner.key === id);
            if (partnerIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đối tác trong danh sách',
                });
            }

            clonePartners.splice(partnerIndex, 1);
            setPartners(clonePartners);

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
            title: 'Tên đối tác',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tên miền',
            dataIndex: 'url',
            key: 'url',
            render: (url) => (
                <a href={url} target="_blank" rel="noreferrer">
                    {url}
                </a>
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
                    onChange={() => handleToggleStatusPartner(data.key)}
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
                                setPartner(data);
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
                            onConfirm={() => confirmDestroyServerPartner(data.key)}
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
                                    title: 'Danh sách đối tác',
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

            {openCreate && <CreatePartner open={openCreate} setOpen={setOpenCreate} callback={partners} setCallback={setPartners} />}

            {openUpdate && partner && (
                <UpdatePartner open={openUpdate} setOpen={setOpenUpdate} partner={partner} callback={partners} setCallback={setPartners} />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={partners} pagination={false} />
                ) : (
                    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
                        <Spin />
                    </Flex>
                )}
            </Card>
        </Space>
    );
}

export default Partners;
