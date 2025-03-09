import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateUser } from '~/services/account';

function UpdateUser({ open, setOpen, user, callback, setCallback }) {
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateUser = async (values) => {
        if (!user.key) {
            return notification.error({
                message: 'Thông báo',
                description: 'Không tìm thấy ID người dùng cần cập nhật',
            });
        }

        const result = await requestAuthUpdateUser(user.key, values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneUsers = [...callback];

            const indexUser = cloneUsers.findIndex((u) => u.key === user.key);
            if (indexUser === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy người dùng trong danh sách',
                });
            }

            cloneUsers[indexUser] = result.data;
            setCallback(cloneUsers);

            form.setFieldValue('password', '');
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
            title="Sửa người dùng"
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
                onFinish={handleUpdateUser}
                initialValues={{
                    role: user.role,
                    email: user.email,
                    status: user.status,
                    username: user.username,
                    last_name: user.last_name,
                    first_name: user.first_name,
                    phone_number: user.phone_number,
                    email_verified: user.email_verified,
                    phone_verified: user.phone_verified,
                }}
            >
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
                            name="username"
                            label="Username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập username người dùng',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập username người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                {
                                    pattern: /^\S{6,30}$/,
                                    message: 'Mật khẩu không hợp lệ',
                                },
                            ]}
                        >
                            <Input placeholder="Bỏ qua nếu không thay đổi" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    type: 'email',
                                    message: 'Vui lòng nhập email người dùng',
                                },
                            ]}
                        >
                            <Input placeholder="Nhập email người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="email_verified"
                            label="Trạng thái email"
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
                                        label: 'Đã xác minh',
                                        value: true,
                                    },
                                    {
                                        label: 'Chưa xác minh',
                                        value: false,
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="phone_number" label="SĐT">
                            <Input placeholder="Nhập sđt người dùng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="phone_verified"
                            label="Trạng thái SĐT"
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
                                        label: 'Đã xác minh',
                                        value: true,
                                    },
                                    {
                                        label: 'Chưa xác minh',
                                        value: false,
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn trạng thái người dùng',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn trạng thái người dùng"
                                options={[
                                    {
                                        value: 'activated',
                                        label: 'Hoạt động',
                                    },
                                    {
                                        value: 'inactivated',
                                        label: 'Không hoạt động',
                                    },
                                    {
                                        value: 'blocked',
                                        label: 'Bị chặn',
                                    },
                                ]}
                            />
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
                                        label: 'ADMIN',
                                        value: 'admin',
                                    },
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
                            Cập nhật
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}
export default UpdateUser;
