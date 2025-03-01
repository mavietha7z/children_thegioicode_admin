import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Flex, Form, Input, InputNumber, Row, Select, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreatePaygate } from '~/services/app';

const { TextArea } = Input;

function CreatePaygate({ open, setOpen, callback, setCallback }) {
    const [logoUrl, setLogoUrl] = useState('');
    const [fileListImage, setFileListImage] = useState([]);
    const [loadingImage, setLoadingImage] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleChangeImage = async (info) => {
        setFileListImage(info.fileList);

        if (info.file.status === 'uploading') {
            setLoadingImage(true);
            return;
        }
        if (info.file.status === 'done') {
            const url = info.file.response.data;
            setLoadingImage(false);
            setLogoUrl(url);
        }
    };

    const handleCreatePaygate = async (values) => {
        const { logo_url: logo, ...others } = values;

        const data = {
            logo_url: logoUrl,
            ...others,
        };

        const result = await requestAuthCreatePaygate(data);

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
            title="Tạo mới cổng thanh toán"
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
                onFinish={handleCreatePaygate}
                initialValues={{ callback_code: '', bonus_point: 0, promotion: 0, vat_tax: 0, minimum_payment: 0, maximum_payment: 0 }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="name"
                            label="Tên đầy đủ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên đầy đủ',
                                },
                            ]}
                        >
                            <Input placeholder="Tên đầy đủ" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="service"
                            label="Dịch vụ"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn loại dịch vụ',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại dịch vụ"
                                options={[
                                    {
                                        label: 'Nạp',
                                        value: 'recharge',
                                    },
                                    {
                                        label: 'Rút',
                                        value: 'withdrawal',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="callback_code"
                            label="Callback code"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập callback code',
                                },
                            ]}
                        >
                            <Input placeholder="Callback code" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="bonus_point" label="Điểm thưởng">
                            <InputNumber placeholder="Điểm thưởng" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="promotion" label="Khuyễn mãi (%)">
                            <InputNumber placeholder="Khuyễn mãi (%)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="vat_tax" label="Thuế giá trị gia tăng (VAT %)">
                            <InputNumber placeholder="Thuế giá trị gia tăng (VAT %)" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="minimum_payment"
                            label="Tối thiểu thanh toán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số tiền',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Tối thiểu thanh toán" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="maximum_payment"
                            label="Tối đa thanh toán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số tiền',
                                },
                            ]}
                        >
                            <InputNumber placeholder="Tối đa thanh toán" className="w-full" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="question" label="Câu hỏi">
                            <TextArea rows={3} placeholder="Câu hỏi" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả">
                            <TextArea rows={3} placeholder="Mô tả" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="logo_url"
                            label="Logo"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Upload
                                name="image"
                                listType="picture-card"
                                showUploadList={false}
                                action={urlUpload}
                                onChange={handleChangeImage}
                                fileList={fileListImage}
                                withCredentials={true}
                            >
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt="avatar"
                                        style={{
                                            width: '100%',
                                        }}
                                    />
                                ) : (
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        {loadingImage ? <LoadingOutlined /> : <PlusOutlined />}
                                    </button>
                                )}
                            </Upload>
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

export default CreatePaygate;
