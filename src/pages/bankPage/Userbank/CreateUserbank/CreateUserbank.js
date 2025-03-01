import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateUserbank, requestAuthGetSearchUserbanks } from '~/services/bank';

let timeout;

const fetchSearchServices = (value, callback, type) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    const fake = async () => {
        const result = await requestAuthGetSearchUserbanks(type, value);
        if (result.status === 200) {
            const data = result.data.map((user) => {
                return {
                    value: user.id,
                    text: user.title,
                };
            });
            callback(data);
        } else {
            notification.error({
                message: 'Thông báo',
                description: result?.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    if (value.length > 1) {
        timeout = setTimeout(fake, 600);
    } else {
        callback([]);
    }
};

const SearchInput = (props) => {
    const [data, setData] = useState([]);
    const [value, setValue] = useState();

    const handleSearch = (newValue) => {
        if (props.type === 'user_id') {
            fetchSearchServices(newValue, setData, 'user');
        }
        if (props.type === 'localbank_id') {
            fetchSearchServices(newValue, setData, 'localbank');
        }
    };

    const handleChange = (newValue) => {
        setValue(newValue);
        props.onChange(newValue);
    };

    return (
        <Select
            showSearch
            value={value}
            placeholder={props.placeholder}
            style={props.style}
            defaultActiveFirstOption={false}
            suffixIcon={null}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            options={(data || []).map((d) => ({
                value: d.value,
                label: d.text,
            }))}
        />
    );
};

function CreateUserbank({ open, setOpen, callback, setCallback }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleCreateLocalbank = async (data) => {
        const result = await requestAuthCreateUserbank(data);

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
            <Form layout="vertical" form={form} onFinish={handleCreateLocalbank} initialValues={{ account_password: '' }}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="user_id"
                            label="Khách hàng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn khách hàng',
                                },
                            ]}
                        >
                            <SearchInput placeholder="Chọn khách hàng" type="user_id" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="localbank_id"
                            label="Ngân hàng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ngân hàng',
                                },
                            ]}
                        >
                            <SearchInput placeholder="Chọn ngân hàng" type="localbank_id" />
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
                            <Input.Password placeholder="Bỏ qua nếu không cần thiết" />
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

export default CreateUserbank;
