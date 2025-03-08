import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateUserbank } from '~/services/bank';

function UpdateUserbank({ open, setOpen, userbank, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleUpdateUserBank = async (data) => {
        const result = await requestAuthUpdateUserbank(userbank.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneUserbanks = [...callback];

            const userbankIndex = cloneUserbanks.findIndex((item) => item.key === userbank.key);
            if (userbankIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ngân hàng thành viên trong danh sách',
                });
            }

            cloneUserbanks[userbankIndex] = result.data;
            setCallback(cloneUserbanks);
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
            title="Tạo mới ngân hàng khách hàng"
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
                onFinish={handleUpdateUserBank}
                initialValues={{
                    account_password: '',
                    branch: userbank.branch,
                    user_id: userbank.user.email,
                    account_number: userbank.account_number,
                    account_holder: userbank.account_holder,
                    localbank_id: userbank.localbank.full_name,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="user_id"
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
                            name="localbank_id"
                            label="Ngân hàng"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Input placeholder="Ngân hàng" readOnly />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="account_number"
                            label="Số tài khoản"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số tài khoản',
                                },
                            ]}
                        >
                            <Input placeholder="Số tài khoản" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="account_holder"
                            label="Chủ tài khoản"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập chủ tài khoản',
                                },
                            ]}
                        >
                            <Input placeholder="Chủ tài khoản" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="account_password" label="Mật khẩu">
                            <Input.Password placeholder="Bỏ qua nếu không thay đổi" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="branch" label="Chi nhánh">
                            <Input placeholder="Chi nhánh" />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex justify="end" style={{ marginTop: 22 }}>
                    <Space>
                        <Button onClick={() => setOpen(false)}>Huỷ</Button>
                        <Button type="primary" htmlType="submit">
                            Tạo mới
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default UpdateUserbank;
