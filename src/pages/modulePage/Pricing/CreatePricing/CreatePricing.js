import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, InputNumber, Row, Select, Space, Spin, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreatePricing, requestAuthSearchPricing } from '~/services/module';

let timeout;

const fetchSearchServices = (value, callback, type) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    const fake = async () => {
        const result = await requestAuthSearchPricing(type, value);

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
        if (props.type === 'cycles_id') {
            fetchSearchServices(newValue, setData, 'cycles');
        }
        if (props.type === 'service_id') {
            fetchSearchServices(newValue, setData, 'service');
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

function CreatePricing({ open, setOpen, callback, setCallback }) {
    const [loading, loadingLoading] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleCreatePricing = async (data) => {
        loadingLoading(true);

        const result = await requestAuthCreatePricing(data);

        loadingLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([result.data, ...callback]);

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
            title="Thêm mới giá sản phẩm"
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
                    onFinish={handleCreatePricing}
                    initialValues={{
                        price: 0,
                        discount: 0,
                        other_fees: 0,
                        renewal_fee: 0,
                        bonus_point: 0,
                        penalty_fee: 0,
                        upgrade_fee: 0,
                        creation_fee: 0,
                        brokerage_fee: 0,
                        cancellation_fee: 0,
                    }}
                >
                    <Row gutter={16}>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="service_id"
                                label="Dịch vụ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn dịch vụ',
                                    },
                                ]}
                            >
                                <SearchInput placeholder="Chọn dịch vụ" type="service_id" />
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
                                <Select
                                    placeholder="Loại dịch vụ"
                                    options={[
                                        { label: 'Mã nguồn', value: 'Source' },
                                        { label: 'Tạo website', value: 'Template' },
                                        { label: 'Cloud Server', value: 'CloudServerProduct' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="cycles_id"
                                label="Chu kỳ"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn chu kỳ',
                                    },
                                ]}
                            >
                                <SearchInput placeholder="Chu kỳ" type="cycles_id" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="price"
                                label="Giá"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giá dịch vụ',
                                    },
                                ]}
                            >
                                <InputNumber placeholder="Giá" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="discount" label="Giảm giá (%)">
                                <InputNumber placeholder="Giảm giá (%)" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="creation_fee" label="Phí khởi tạo">
                                <InputNumber placeholder="Phí khởi tạo" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="penalty_fee" label="Phí phạt">
                                <InputNumber placeholder="Phí phạt" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="renewal_fee" label="Phí gia hạn">
                                <InputNumber placeholder="Phí gia hạn" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="upgrade_fee" label="Phí nâng cấp">
                                <InputNumber placeholder="Phí nâng cấp" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="cancellation_fee" label="Phí huỷ (%)">
                                <InputNumber placeholder="Phí huỷ (%)" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="brokerage_fee" label="Phí môi giới">
                                <InputNumber placeholder="Phí môi giới" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="other_fees" label="Chi phí khác">
                                <InputNumber placeholder="Chi phí khác" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item name="bonus_point" label="Điểm thưởng">
                                <InputNumber placeholder="Điểm thưởng" style={{ width: '100%' }} />
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
            )}
        </Drawer>
    );
}

export default CreatePricing;
