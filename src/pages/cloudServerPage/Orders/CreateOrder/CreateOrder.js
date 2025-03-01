import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Row, Select, Space, TimePicker, notification } from 'antd';

import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthSearchUser } from '~/services/account';
import { controlAuthGetCloudServerTryIt, requestAuthCreateCloudServerOrder } from '~/services/cloudServer';

let timeout;
const fetchSearchServices = (value, callback) => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    const fake = async () => {
        const result = await requestAuthSearchUser(value, 'service');
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
        fetchSearchServices(newValue, setData);
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

function CreateOrder({ open, setOpen, callback, setCallback }) {
    const [plans, setPlans] = useState([]);
    const [images, setImages] = useState([]);
    const [regions, setRegions] = useState([]);
    const [products, setProducts] = useState([]);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await controlAuthGetCloudServerTryIt();

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                setImages(result.data.images);
                setRegions(result.data.regions);
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

    const handleOnChangeSelectRegion = (value) => {
        const cloneRegions = [...regions];
        const regionIndex = cloneRegions.findIndex((region) => region.id === value);
        setPlans(cloneRegions[regionIndex].plans);
    };

    const handleOnChangeSelectPlan = (value) => {
        const cloneRegions = [...regions];
        const targetPlan = cloneRegions.flatMap((region) => region.plans).find((plan) => plan.id === value);
        setProducts(targetPlan.products);
    };

    const handleCreateOrderCloudServerTryIt = async (values) => {
        const { image_id, plan_id, product_id, region_id, user_id } = values;

        const expired_at = values.expired_at.format('HH:mm:ss');
        const data = {
            user_id,
            plan_id,
            image_id,
            region_id,
            product_id,
            expired_at,
        };

        const result = await requestAuthCreateCloudServerOrder(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneOrders = [result.data, ...callback];

            setCallback(cloneOrders);

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
            title="Thêm đơn dùng thử"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleCreateOrderCloudServerTryIt}>
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
                            <SearchInput placeholder="Chọn khách hàng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="region_id"
                            label="Khu vực"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn khu vực',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn khu vực"
                                onChange={handleOnChangeSelectRegion}
                                options={regions.map((region) => {
                                    return {
                                        value: region.id,
                                        label: region.title,
                                    };
                                })}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="plan_id"
                            label="Loại máy chủ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn loại máy chủ',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại máy chủ"
                                onChange={handleOnChangeSelectPlan}
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
                        <Form.Item
                            name="image_id"
                            label="Hệ điều hành"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn hệ điều hành',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn hệ điều hành"
                                options={images.map((image) => {
                                    return {
                                        value: image.id,
                                        label: `${image.group} - ${image.title}`,
                                    };
                                })}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="product_id"
                            label="Cấu hình"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn cấu hình',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn cấu hình"
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
                        <Form.Item
                            name="expired_at"
                            label="Thời gian dùng thử"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian dùng thử' }]}
                        >
                            <TimePicker className="w-full" />
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

export default CreateOrder;
