import { useDispatch } from 'react-redux';
import { IconCopy } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { serviceCopyKeyBoard } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateOrderTemplate } from '~/services/template';

function OrderTemplateDetail({ open, setOpen, orderTemplate, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateOrderTemplate = async (values) => {
        const data = {
            status: values.status,
            app_domain: values.app_domain,
            email_admin: values.email_admin,
            description: values.description,
            admin_domain: values.admin_domain,
            password_admin: values.password_admin,
        };

        const result = await requestAuthUpdateOrderTemplate(orderTemplate.key, data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);
            const cloneOrderTemplates = [...callback];

            const indexOrderTemplate = cloneOrderTemplates.findIndex((item) => item.key === orderTemplate.key);
            if (indexOrderTemplate === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy đơn hàng này trong danh sách',
                });
            }
            cloneOrderTemplates[indexOrderTemplate] = result.data;
            setCallback(cloneOrderTemplates);

            setOpen(false);
            form.resetFields();
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
            title={`Chi tiết đơn #${orderTemplate.id}`}
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
                className="api-detail"
                form={form}
                onFinish={handleUpdateOrderTemplate}
                initialValues={{
                    status: orderTemplate.status,
                    app_domain: orderTemplate.app_domain,
                    description: orderTemplate.description,
                    template: orderTemplate.template.title,
                    email_admin: orderTemplate.email_admin,
                    admin_domain: orderTemplate.admin_domain,
                    password_admin: orderTemplate.password_admin,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="template" label="Mẫu" rules={[{ required: true }]}>
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn trạng thái',
                                },
                            ]}
                        >
                            <Select
                                options={[
                                    {
                                        label: 'Đang hoạt động',
                                        value: 'activated',
                                    },
                                    {
                                        label: 'Chờ xác nhận',
                                        value: 'wait_confirm',
                                    },
                                    {
                                        label: 'Đang xử lý',
                                        value: 'pending',
                                    },
                                    {
                                        label: 'Vô hiệu hoá',
                                        value: 'inactivated',
                                    },
                                    {
                                        label: 'Đã hết hạn',
                                        value: 'expired',
                                    },
                                    {
                                        label: 'Đã bị khoá',
                                        value: 'blocked',
                                    },
                                    {
                                        label: 'Đã bị xoá',
                                        value: 'deleted',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="app_domain"
                            label="Tên miền website"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên miền website',
                                },
                            ]}
                        >
                            <Input placeholder="Tên miền website" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="admin_domain"
                            label="Tên miền quản trị"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên miền quản trị',
                                },
                            ]}
                        >
                            <Input placeholder="Tên miền quản trị" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="email_admin"
                            label="Tài khoản quản trị"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tài khoản quản trị',
                                },
                                {
                                    type: 'email',
                                    message: 'Địa chỉ email không hợp lệ',
                                },
                            ]}
                        >
                            <Input placeholder="Tài khoản quản trị" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="password_admin"
                            label="Mật khẩu quản trị"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu quản trị',
                                },
                            ]}
                        >
                            <Input.Password placeholder="Mật khẩu quản trị" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Ghi chú">
                            <Input.TextArea placeholder="Ghi chú" rows={3} />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <div className="copy">
                            <pre>
                                <code className="text-copy">{JSON.stringify(orderTemplate.cloudflare, null, 3)}</code>
                            </pre>

                            <div className="btn-copy">
                                <Button
                                    size="small"
                                    className="box-center"
                                    onClick={() => serviceCopyKeyBoard(JSON.stringify(orderTemplate.cloudflare, null, 3))}
                                >
                                    <IconCopy size={18} />
                                </Button>
                            </div>
                        </div>
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

export default OrderTemplateDetail;
