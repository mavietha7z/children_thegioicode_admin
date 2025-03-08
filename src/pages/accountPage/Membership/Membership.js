import moment from 'moment';
import { useDispatch } from 'react-redux';
import { Fragment, useEffect, useState } from 'react';
import { IconArrowLeft, IconInfoCircleFilled } from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Flex, Spin, Space, Table, Button, Tooltip, notification, Breadcrumb, Switch, Pagination } from 'antd';

import router from '~/configs/routes';
import { convertCurrency } from '~/configs';
import UpdateMembership from './UpdateMembership';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetMemberships, requestAuthUpdateMembership } from '~/services/account';

function Membership() {
    const [loading, setLoading] = useState(false);
    const [membership, setMembership] = useState(null);
    const [memberships, setMemberships] = useState([]);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(searchParams.get('page') || 1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const id = searchParams.get('id');

    useEffect(() => {
        document.title = 'Quản trị website - Danh sách bậc thành viên';

        const fetch = async () => {
            setLoading(true);
            const result = await requestAuthGetMemberships(page, id);

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPages(result.pages);
                setMemberships(result.data);
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

    const handleToggleStatusMembership = async (id) => {
        if (!id) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID bậc thành viên cần sửa',
            });
        }

        const result = await requestAuthUpdateMembership(id, 'status', {});

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneMemberships = [...memberships];

            const indexMembership = cloneMemberships.findIndex((membership) => membership.key === id);
            if (indexMembership === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy bậc thành viên trong danh sách',
                });
            }

            cloneMemberships[indexMembership].status = !cloneMemberships[indexMembership].status;
            setMemberships(cloneMemberships);

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
            title: 'Tên bậc',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Fragment>{name.toUpperCase()}</Fragment>,
        },
        {
            title: 'Điểm cần đạt',
            dataIndex: 'achieve_point',
            key: 'achieve_point',
            render: (achieve_point) => <Fragment>{convertCurrency(achieve_point).slice(0, -1)} điểm</Fragment>,
        },
        {
            title: 'Giảm giá dịch vụ',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => <Fragment>{discount}%</Fragment>,
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
                    onChange={() => handleToggleStatusMembership(data.key)}
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
                <Tooltip title="Xem chi tiết">
                    <Button
                        className="box-center"
                        type="primary"
                        size="small"
                        onClick={() => {
                            setMembership(data);
                            setOpenUpdate(true);
                        }}
                    >
                        <IconInfoCircleFilled size={18} />
                    </Button>
                </Tooltip>
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
                                    title: 'Nhóm thành viên',
                                },
                            ]}
                        />
                    </Flex>
                </Flex>
            </Card>

            {openUpdate && (
                <UpdateMembership
                    open={openUpdate}
                    setOpen={setOpenUpdate}
                    membership={membership}
                    callback={memberships}
                    setCallback={setMemberships}
                />
            )}

            <Card style={{ minHeight: 'calc(-171px + 100vh)' }}>
                {!loading ? (
                    <Table columns={columns} dataSource={memberships} pagination={false} />
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

export default Membership;
