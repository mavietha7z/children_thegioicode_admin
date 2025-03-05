import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateApikey } from '~/services/api';

function DetailApikey({ open, setOpen, apikey, callback, setCallback }) {
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateApikey = async (values) => {
        setLoading(true);

        const data = {
            used: values.used,
            free_usage: values.free_usage,
        };

        const result = await requestAuthUpdateApikey('info', apikey.key, data);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneApiKeys = [...callback];

            const indexApikey = cloneApiKeys.findIndex((cycles) => cycles.key === apikey.key);
            if (indexApikey === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy apikey trong danh sách',
                });
            }

            cloneApiKeys[indexApikey] = result.data;
            setCallback(cloneApiKeys);

            setOpen(false);
            notification.success({
                message: 'Thông báo',
                description: result?.message,
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
            title="Chi tiết apikey"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            {loading ? (
                <Flex style={{ height: '60vh' }} align="center" justify="center">
                    <Spin />
                </Flex>
            ) : (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleUpdateApikey}
                    initialValues={{
                        used: apikey.used,
                        key: apikey.apikey,
                        user: apikey.user.email,
                        service: apikey.service.title,
                        free_usage: apikey.free_usage,
                        service_type: apikey.service_type,
                    }}
                >
                    <Row gutter={16}>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="user"
                                label="Khách hàng"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input placeholder="Khách hàng" readOnly />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="service"
                                label="Dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input placeholder="Dịch vụ" readOnly />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="service_type"
                                label="Loại dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn loại dịch vụ',
                                    },
                                ]}
                            >
                                <Select placeholder="Loại dịch vụ" options={[{ label: 'API', value: 'Api' }]} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="key"
                                label="Apikey"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input placeholder="Apikey" readOnly />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="free_usage" label="Lượt dùng miễn phí">
                                <InputNumber placeholder="Lượt dùng miễn phí" className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="used" label="Tổng lượt đã dùng">
                                <InputNumber placeholder="Tổng lượt đã dùng" className="w-full" />
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
            )}
        </Drawer>
    );
}

export default DetailApikey;
