import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconInfoCircleFilled, IconTrash } from '@tabler/icons-react';
import {
    Row,
    Col,
    Card,
    Flex,
    Spin,
    Space,
    Image,
    Table,
    Input,
    Button,
    Switch,
    Tooltip,
    Popconfirm,
    Breadcrumb,
    Pagination,
    notification,
} from 'antd';

import router from '~/configs/routes';
import CreateLocalbank from './CreateLocalbank';
import LocalbankDetail from './LocalbankDetail';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthDestroyLocalbank, requestAuthGetLocalbanks, requestAuthUpdateLocalbank } from '~/services/bank';

function Localbank() {
    const [loading, setLoading] = useState(false);
    const [localbanks, setLocalbanks] = useState([]);
    const [localbank, setLocalbank] = useState(null);
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
        document.title = 'Quản trị website - Danh sách ngân hàng';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetLocalbanks(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setLocalbanks(result.data);
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

    const handleToggleStatusLocalbank = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID ngân hàng cần cập nhật',
            });
        }

        const result = await requestAuthUpdateLocalbank(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneLocalbanks = [...localbanks];

            const localbankIndex = cloneLocalbanks.findIndex((localbank) => localbank.key === id);
            if (localbankIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ID ngân hàng trong danh sách',
                });
            }

            cloneLocalbanks[localbankIndex].status = !cloneLocalbanks[localbankIndex].status;
            setLocalbanks(cloneLocalbanks);

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

    const confirmDestroyLocalbank = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không lấy được ID ngân hàng cần xoá',
            });
        }

        const result = await requestAuthDestroyLocalbank(id);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneLocalbanks = [...localbanks];

            const localbankIndex = cloneLocalbanks.findIndex((localbank) => localbank.key === id);
            if (localbankIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ngân hàng trong danh sách',
                });
            }

            cloneLocalbanks.splice(localbankIndex, 1);
            setLocalbanks(cloneLocalbanks);

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
            title: 'Thông tin',
            key: 'name',
            render: (data) => (
                <Fragment>
                    <Tooltip title="Tên viết tắt">
                        <span>{data.sub_name}</span>
                    </Tooltip>
                    <br />
                    <Tooltip title="Tên đầy đủ">
                        <span>{data.full_name}</span>
                    </Tooltip>
                </Fragment>
            ),
        },
        {
            title: 'Logo',
            dataIndex: 'logo_url',
            key: 'logo_url',
            render: (logo_url) => (
                <Image width={40} height={40} src={logo_url} alt="Avatar" fallback={imageNotFound} className="rounded-8" />
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                if (type === 'e-wallet') {
                    return <span>Ví điện tử</span>;
                } else {
                    return <span>Ngân hàng</span>;
                }
            },
        },
        {
            title: 'Mã NH',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Mã liên NH',
            dataIndex: 'interbank_code',
            key: 'interbank_code',
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
                    onChange={() => handleToggleStatusLocalbank(data.key)}
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
                                setLocalbank(data);
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
                            onConfirm={() => confirmDestroyLocalbank(data.key)}
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
                                    title: 'Danh sách ngân hàng',
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

            {openCreate && <CreateLocalbank open={openCreate} setOpen={setOpenCreate} callback={localbanks} setCallback={setLocalbanks} />}
            {openUpdate && localbank && (
                <LocalbankDetail
                    open={openUpdate}
                    setOpen={setOpenUpdate}
                    localbank={localbank}
                    callback={localbanks}
                    setCallback={setLocalbanks}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={localbanks} pagination={false} />
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

export default Localbank;
