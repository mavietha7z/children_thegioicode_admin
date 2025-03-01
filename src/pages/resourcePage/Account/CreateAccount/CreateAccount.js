import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Space, Form, Input, Button, Row, Col, Drawer, Flex, notification, Select } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateResourceAccount, requestAuthGetInitializeResourceAccount } from '~/services/resource';

const { TextArea } = Input;

function CreateAccount({ open, setOpen, callback, setCallback }) {
    const [products, setProducts] = useState([]);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await requestAuthGetInitializeResourceAccount();

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setProducts(result.data);
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

    const handleCreateAccount = async (values) => {
        const result = await requestAuthCreateResourceAccount(values);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([...callback, result.data]);
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
            title="Thêm tài khoản"
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
                onFinish={handleCreateAccount}
                initialValues={{
                    description: '',
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="product_id"
                            label="Loại tài khoản"
                            rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
                        >
                            <Select
                                placeholder="Chọn loại tài khoản"
                                options={products.map((product) => {
                                    return {
                                        value: product.id,
                                        label: product.title,
                                    };
                                })}
                            />
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
                            Thêm mới
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default CreateAccount;
