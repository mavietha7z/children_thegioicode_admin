import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Drawer, Flex, Form, Input, Row, Select, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateLocalbank } from '~/services/bank';

function CreateLocalbank({ open, setOpen, callback, setCallback }) {
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

    const handleCreateLocalbank = async (values) => {
        const { logo_url: logo, ...others } = values;

        const data = {
            logo_url: logoUrl,
            ...others,
        };
        const result = await requestAuthCreateLocalbank(data);

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
            title="Tạo mới ngân hàng"
            width={820}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleCreateLocalbank}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="full_name"
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
                            name="sub_name"
                            label="Tên viết tắt"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên viết tắt',
                                },
                            ]}
                        >
                            <Input placeholder="Tên viết tắt" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="code"
                            label="Mã NH"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mã ngân hàng',
                                },
                            ]}
                        >
                            <Input placeholder="Mã ngân hàng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="interbank_code"
                            label="Mã liên NH"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mã liên ngân hàng',
                                },
                            ]}
                        >
                            <Input placeholder="Mã liên ngân hàng" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="type"
                            label="Loại"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn loại ngân hàng',
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại ngân hàng"
                                options={[
                                    {
                                        label: 'Ngân hàng',
                                        value: 'bank',
                                    },
                                    {
                                        label: 'Ví điện tử',
                                        value: 'e-wallet',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="logo_url" label="Logo">
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

export default CreateLocalbank;
