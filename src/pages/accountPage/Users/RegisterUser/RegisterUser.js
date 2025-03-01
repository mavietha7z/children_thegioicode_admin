import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthRegisterUser } from '~/services/account';

function RegisterUser({ open, setOpen, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleRegisterUser = async (data) => {
        const result = await requestAuthRegisterUser(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);

            form.resetFields();
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
            title="Tạo mới người dùng"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleRegisterUser} initialValues={{ phone_number: '' }}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="first_name"
                            label="Họ"
                            rules={[
                                {
                                    required: true,
                                    min: 2,
                                    message: 'Vui lòng nhập họ người dùng',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập họ người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="last_name"
                            label="Tên"
                            rules={[
                                {
                                    required: true,
                                    min: 2,
                                    message: 'Vui lòng nhập tên người dùng',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email',
                                },
                                {
                                    type: 'email',
                                    message: 'Email không đúng định dạng',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập email người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                                {
                                    pattern: /^\S{6,30}$/,
                                    message: 'Mật khẩu không hợp lệ',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập mật khẩu người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="phone_number" label="SĐT">
                            <Input placeholder="Nhập sđt người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="role"
                            label="Vai trò"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn vai trò người dùng',
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn vai trò người dùng"
                                options={[
                                    {
                                        label: 'USER',
                                        value: 'user',
                                    },
                                    {
                                        label: 'CREATE',
                                        value: 'create',
                                    },
                                    {
                                        label: 'EDIT',
                                        value: 'edit',
                                    },
                                    {
                                        label: 'DELETE',
                                        value: 'delete',
                                    },
                                    {
                                        label: 'VIEW',
                                        value: 'view',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="end" style={{ marginTop: 22 }}>
                    <Space>
                        <Button onClick={() => setOpen(false)}>Huỷ</Button>
                        <Button type="primary" htmlType="submit">
                            Đăng ký
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default RegisterUser;
