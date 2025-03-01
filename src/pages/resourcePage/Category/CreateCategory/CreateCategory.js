import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Space, Form, Input, Button, Row, Col, Drawer, Flex, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateResourceCategory } from '~/services/resource';

const { TextArea } = Input;

function CreateCategory({ open, setOpen, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState('');
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
            setImageUrl(url);
        }
    };

    const handleCreateCategory = async (values) => {
        const { image_url: imageUrl, ...other } = values;

        let image_url = '';
        if (imageUrl) {
            image_url = imageUrl.fileList[imageUrl.fileList.length - 1].response.data;
        }

        const data = {
            image_url,
            ...other,
        };

        const result = await requestAuthCreateResourceCategory(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setCallback([...callback, result.data]);
            form.resetFields();
            setImageUrl('');
            setFileListImage([]);
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
            title="Thêm danh mục tài khoản"
            width={620}
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
                onFinish={handleCreateCategory}
                initialValues={{
                    priority: 1,
                    description: '',
                }}
            >
                <Row gutter={16}>
                    <Col md={24} xs={24}>
                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                            <Input placeholder="Tiêu đề" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="Mô tả ngắn">
                            <TextArea rows={3} placeholder="Nhập mô tả ngắn" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="image_url" label="Ảnh" rules={[{ required: true, message: 'Vui lòng tải lên ảnh đại diện' }]}>
                            <Upload
                                name="image"
                                listType="picture-card"
                                showUploadList={false}
                                action={urlUpload}
                                onChange={handleChangeImage}
                                fileList={fileListImage}
                                withCredentials={true}
                            >
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
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
                            Thêm mới
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default CreateCategory;
