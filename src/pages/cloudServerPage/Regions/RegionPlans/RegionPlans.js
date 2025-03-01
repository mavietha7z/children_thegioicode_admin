import { useDispatch } from 'react-redux';
import { Fragment, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Flex, Image, Popconfirm, Table, Tooltip, notification } from 'antd';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import {
    controlAuthGetCloudServerPlans,
    requestAuthAddPlanToCloudServerRegion,
    requestAuthRemovePlanInCloudServerRegion,
} from '~/services/cloudServer';

function RegionPlans({ open, setOpen, region, plans, callback, setCallback }) {
    const [planChildrens, setPlanChildrens] = useState([]);
    const [openChildren, setOpenChildren] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleGetCloudServerPlans = async () => {
        const result = await controlAuthGetCloudServerPlans(1);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setOpenChildren(true);
            setPlanChildrens(result.data);
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    const handleAddPlanToRegion = async (id) => {
        const data = {
            plan_id: id,
            id: region.key,
        };

        const result = await requestAuthAddPlanToCloudServerRegion(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneRegions = [...callback];

            const regionIndex = cloneRegions.findIndex((re) => re.key === region.key);
            if (regionIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy khu vực trong danh sách',
                });
            }

            cloneRegions[regionIndex] = result.data;
            setCallback(cloneRegions);
            setOpen(false);
            setOpenChildren(false);
            setPlanChildrens([]);
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

    const handleRemovePlanInRegion = async (id) => {
        const data = {
            plan_id: id,
            id: region.key,
        };

        const result = await requestAuthRemovePlanInCloudServerRegion(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const clonePlans = [...plans];

            const planIndex = clonePlans.findIndex((plan) => plan._id === id);
            if (planIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy máy chủ trong danh sách',
                });
            }

            clonePlans.splice(planIndex, 1);

            const cloneRegions = [...callback];

            const regionIndex = cloneRegions.findIndex((re) => re.key === region.key);
            if (regionIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy khu vực trong danh sách',
                });
            }

            cloneRegions[regionIndex].plans = clonePlans;

            setCallback(cloneRegions);
            setOpen(false);
            setOpenChildren(false);
            setPlanChildrens([]);
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
            title: 'Hành động',
            key: 'action',
            render: (data) => (
                <Fragment>
                    {openChildren ? (
                        <Tooltip title="Thêm plan">
                            <Button className="box-center" type="primary" size="small" onClick={() => handleAddPlanToRegion(data.key)}>
                                <IconPlus size={18} />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Xoá">
                            <Popconfirm
                                title="Delete?"
                                description={`#${data.id}`}
                                onConfirm={() => handleRemovePlanInRegion(data._id)}
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
                    )}
                </Fragment>
            ),
        },
    ];

    return (
        <Drawer
            title={
                <Flex align="center" justify="space-between">
                    <span>Plans có trong khu vực {region.title}</span>
                    <Button type="primary" onClick={handleGetCloudServerPlans}>
                        Thêm Plan
                    </Button>
                </Flex>
            }
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Table columns={columns} dataSource={plans.map((plan, index) => ({ key: index, ...plan }))} pagination={false} />

            {openChildren && (
                <Drawer
                    title="Danh sách plans"
                    width={820}
                    onClose={() => setOpenChildren(false)}
                    open={openChildren}
                    styles={{
                        body: {
                            paddingBottom: 80,
                        },
                    }}
                >
                    <Table columns={columns} dataSource={planChildrens} pagination={false} />
                </Drawer>
            )}
        </Drawer>
    );
}

export default RegionPlans;
