import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateResourceAccount } from '~/services/resource';

const { TextArea } = Input;

function UpdateAccount({ open, setOpen, account, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateAccount = async (values) => {
        const { username, password, description } = values;
        const data = {
            username,
            password,
            description,
        };

        const result = await requestAuthUpdateResourceAccount(account.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneAccounts = [...callback];

            const accountIndex = cloneAccounts.findIndex((acc) => acc.key === account.key);
            if (accountIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy danh mục trong danh sách',
                });
            }

            cloneAccounts[accountIndex] = result.data;
            cloneAccounts.sort((a, b) => a.priority - b.priority);
            setCallback(cloneAccounts);

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
            title="Chi tiết loại tài khoản"
            width={720}
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
                onFinish={handleUpdateAccount}
                initialValues={{
                    username: account.username,
                    password: account.password,
                    product: account.product.title,
                    description: account.description,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="product"
                            label="Loại tài khoản"
                            rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
                        >
                            <Input placeholder="Loại tài khoản" readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Vui lòng nhập username' }]}>
                            <Input placeholder="Username" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Vui lòng nhập password' }]}>
                            <Input placeholder="Password" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Thông tin thêm">
                            <TextArea rows={3} placeholder="VD: Cookie, Token, Date, 2FA..." />
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
export default UpdateAccount;
