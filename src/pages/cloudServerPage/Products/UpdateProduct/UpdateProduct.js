import { useDispatch } from 'react-redux';
import TextArea from 'antd/es/input/TextArea';
import { Fragment, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { controlAuthGetInitializeCloudServerPlans, requestAuthUpdateCloudServerProduct } from '~/services/cloudServer';

function UpdateProduct({ open, setOpen, product, callback, setCallback }) {
    const [plans, setPlans] = useState([]);
    const [isCustomizable, setIsCustomizable] = useState(product.customize);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await controlAuthGetInitializeCloudServerPlans();

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setPlans(result.data);
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

    const handleCustomizeChange = (value) => {
        setIsCustomizable(value);
    };

    const handleUpdateProduct = async (values) => {
        if (!product.key) {
            return notification.error({ message: 'Thông báo', description: 'Không thể lấy được ID cấu hình cần cập nhật' });
        }

        const {
            ipv4,
            ipv6,
            code,
            core,
            disk,
            title,
            memory,
            commit,
            plan_id,
            support,
            priority,
            min_core,
            min_disk,
            max_disk,
            max_core,
            bandwidth,
            customize,
            disk_info,
            core_info,
            min_memory,
            max_memory,
            description,
            memory_info,
            network_port,
            network_speed,
            network_inter,
        } = values;

        let data = {
            ipv4,
            ipv6,
            code,
            disk,
            core,
            title,
            memory,
            commit,
            plan_id,
            support,
            priority,
            disk_info,
            bandwidth,
            customize,
            core_info,
            description,
            memory_info,
            network_port,
            network_speed,
            network_inter,
            customize_config: {
                min_core: 1,
                max_core: 16,
                min_memory: 1,
                max_memory: 32,
                min_disk: 20,
                max_disk: 240,
            },
        };

        if (customize) {
            data.customize_config.min_core = min_core;
            data.customize_config.max_core = max_core;
            data.customize_config.min_disk = min_disk;
            data.customize_config.max_disk = max_disk;
            data.customize_config.min_memory = min_memory;
            data.customize_config.max_memory = max_memory;
        }

        const result = await requestAuthUpdateCloudServerProduct(product.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneProducts = [...callback];

            const productIndex = cloneProducts.findIndex((pro) => pro.key === product.key);
            if (productIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy cấu hình trong danh sách',
                });
            }

            cloneProducts[productIndex] = result.data;
            setCallback(cloneProducts);

            setOpen(false);
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

    return (
        <Drawer
            title="Chi tiết cấu hình"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form
                layout="vertical"
                form={form}
                onFinish={handleUpdateProduct}
                initialValues={{
                    ipv4: product.ipv4,
                    ipv6: product.ipv6,
                    disk: product.disk,
                    code: product.code,
                    core: product.core,
                    title: product.title,
                    memory: product.memory,
                    commit: product.commit,
                    support: product.support,
                    plan_id: product.plan._id,
                    priority: product.priority,
                    bandwidth: product.bandwidth,
                    customize: product.customize,
                    core_info: product.core_info,
                    disk_info: product.disk_info,
                    description: product.description,
                    memory_info: product.memory_info,
                    network_port: product.network_port,
                    network_speed: product.network_speed,
                    network_inter: product.network_inter,
                    min_disk: product.customize_config.min_disk,
                    max_disk: product.customize_config.max_disk,
                    min_core: product.customize_config.min_core,
                    max_core: product.customize_config.max_core,
                    min_memory: product.customize_config.min_memory,
                    max_memory: product.customize_config.max_memory,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="plan_id" label="Máy chủ" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                            <Select
                                placeholder="Chọn máy chủ"
                                options={plans.map((plan) => {
                                    return {
                                        value: plan.id,
                                        label: plan.title,
                                    };
                                })}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="title" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                            <Input placeholder="Tên" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="code" label="Mã" rules={[{ required: true, message: 'Vui lòng nhập mã cấu hình' }]}>
                            <Input placeholder="Mã" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="priority" label="Sắp xếp" rules={[{ required: true, message: 'Vui lòng nhập thứ tự sắp xếp' }]}>
                            <InputNumber className="w-full" placeholder="Sắp xếp" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="core" label="CPU" rules={[{ required: true, message: 'Vui lòng nhập cpu' }]}>
                            <InputNumber className="w-full" placeholder="CPU" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="core_info"
                            label="Loại CPU"
                            rules={[{ required: true, message: 'Vui lòng nhập tên cpu được dùng' }]}
                        >
                            <Input placeholder="Loại CPU" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="memory" label="RAM" rules={[{ required: true, message: 'Vui lòng nhập ram' }]}>
                            <InputNumber className="w-full" placeholder="RAM" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="memory_info"
                            label="Loại RAM"
                            rules={[{ required: true, message: 'Vui lòng nhập tên ram được dùng' }]}
                        >
                            <Input placeholder="Loại RAM" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="disk" label="Dung lượng" rules={[{ required: true, message: 'Vui lòng nhập dung lượng' }]}>
                            <InputNumber className="w-full" placeholder="Dung lượng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="disk_info"
                            label="Loại dung lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập tên ssd được dùng' }]}
                        >
                            <Input placeholder="Loại dung lượng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bandwidth" label="Băng thông" rules={[{ required: true, message: 'Vui lòng nhập băng thông' }]}>
                            <InputNumber className="w-full" placeholder="Băng thông" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="network_speed"
                            label="Tốc độ mạng"
                            rules={[{ required: true, message: 'Vui lòng nhập tốc độ mạng' }]}
                        >
                            <InputNumber className="w-full" placeholder="Tốc độ mạng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="network_port"
                            label="Mạng cổng"
                            rules={[{ required: true, message: 'Vui lòng nhập mạng cổng cấu hình' }]}
                        >
                            <InputNumber className="w-full" placeholder="Mạng cổng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="network_inter"
                            label="Mạng quốc tế"
                            rules={[{ required: true, message: 'Vui lòng nhập mạng quốc tế cấu hình' }]}
                        >
                            <InputNumber className="w-full" placeholder="Mạng quốc tế" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="commit" label="Cam kết" rules={[{ required: true, message: 'Vui lòng nhập cam kết nếu có' }]}>
                            <Input placeholder="Cam kết" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="support" label="Hỗ trợ" rules={[{ required: true, message: 'Vui lòng nhập hỗ trợ nếu có' }]}>
                            <Input placeholder="Hỗ trợ" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="ipv4" label="IPv4" rules={[{ required: true, message: 'Vui lòng nhập số lượng ipv4' }]}>
                            <InputNumber className="w-full" placeholder="IPv4" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="ipv6" label="IPv6" rules={[{ required: true, message: 'Vui lòng nhập số lượng ipv4' }]}>
                            <InputNumber className="w-full" placeholder="IPv6" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="customize"
                            label="Cầu hình tuỳ chọn"
                            rules={[{ required: true, message: 'Vui lòng chọn cấu hình tuỳ chọn' }]}
                        >
                            <Select
                                placeholder="Chọn cầu hình"
                                options={[
                                    {
                                        label: 'Không cho',
                                        value: false,
                                    },
                                    {
                                        label: 'Cho phép',
                                        value: true,
                                    },
                                ]}
                                onChange={handleCustomizeChange}
                            />
                        </Form.Item>
                    </Col>
                    {isCustomizable && (
                        <Fragment>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="min_core"
                                    label="CPU tối thiểu"
                                    rules={[{ required: true, message: 'Vui lòng nhập cpu tối thiểu' }]}
                                >
                                    <InputNumber className="w-full" placeholder="CPU tối thiểu" />
                                </Form.Item>
                            </Col>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="max_core"
                                    label="CPU tối đa"
                                    rules={[{ required: true, message: 'Vui lòng nhập CPU tối đa' }]}
                                >
                                    <InputNumber className="w-full" placeholder="CPU tối đa" />
                                </Form.Item>
                            </Col>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="min_memory"
                                    label="Ram tối thiểu"
                                    rules={[{ required: true, message: 'Vui lòng nhập ram tối thiểu' }]}
                                >
                                    <InputNumber className="w-full" placeholder="Ram tối thiểu" />
                                </Form.Item>
                            </Col>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="max_memory"
                                    label="Ram tối đa"
                                    rules={[{ required: true, message: 'Vui lòng nhập ram tối đa' }]}
                                >
                                    <InputNumber className="w-full" placeholder="Ram tối đa" />
                                </Form.Item>
                            </Col>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="min_disk"
                                    label="Disk tối thiểu"
                                    rules={[{ required: true, message: 'Vui lòng nhập disk tối thiểu' }]}
                                >
                                    <InputNumber className="w-full" placeholder="Disk tối thiểu" />
                                </Form.Item>
                            </Col>
                            <Col md={12} xs={24}>
                                <Form.Item
                                    name="max_disk"
                                    label="Disk tối đa"
                                    rules={[{ required: true, message: 'Vui lòng nhập disk tối đa' }]}
                                >
                                    <InputNumber className="w-full" placeholder="Disk tối đa" />
                                </Form.Item>
                            </Col>
                        </Fragment>
                    )}
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả">
                            <TextArea rows={3} placeholder="Nhập mô tả ngắn" />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="end" style={{ marginTop: 22 }}>
                    <Space>
                        <Button onClick={() => setOpen(false)}>Huỷ</Button>
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default UpdateProduct;
