import { useState } from 'react';
import { useDispatch } from 'react-redux';
import TextArea from 'antd/es/input/TextArea';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Image, Input, Row, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { configGetBase64 } from '~/configs';
import imageNotFound from '~/assets/image/image_not.jpg';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthCreateCloudServerPlan } from '~/services/cloudServer';

function CreatePlan({ open, setOpen, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState([]);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [previewOpenImageUrl, setPreviewOpenImageUrl] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handlePreviewImageUrl = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await configGetBase64(file.originFileObj);
        }

        setPreviewImageUrl(file.url || file.preview);
        setPreviewOpenImageUrl(true);
    };

    const handleChangeImageUrl = async ({ fileList: newFileList }) => {
        setImageUrl(newFileList);
    };

    const handleCreatePlan = async (values) => {
        const { title, description } = values;

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length < 1) {
            return notification.error({ message: 'Thông báo', description: 'Vui lòng chọn tải lên ảnh máy chủ' });
        }

        const data = {
            title,
            description,
            image_url: image_url[0],
        };

        const result = await requestAuthCreateCloudServerPlan(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneImages = [result.data, ...callback];

            setCallback(cloneImages);

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
            title="Thêm mới máy chủ"
            width={620}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Form layout="vertical" form={form} onFinish={handleCreatePlan}>
                <Row gutter={16}>
                    <Col md={24} xs={24}>
                        <Form.Item name="title" label="Tên máy chủ" rules={[{ required: true, message: 'Vui lòng nhập tên máy chủ' }]}>
                            <Input placeholder="Tên máy chủ" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả máy chủ' }]}>
                            <TextArea rows={3} placeholder="Mô tả" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item label="Ảnh">
                            <Upload
                                action={urlUpload}
                                listType="picture-card"
                                fileList={imageUrl}
                                onPreview={handlePreviewImageUrl}
                                onChange={handleChangeImageUrl}
                                withCredentials={true}
                                name="image"
                            >
                                {imageUrl.length >= 1 ? null : (
                                    <button
                                        style={{
                                            border: 0,
                                            background: 'none',
                                        }}
                                        type="button"
                                    >
                                        <PlusOutlined />
                                    </button>
                                )}
                            </Upload>
                            {previewImageUrl.length > 0 && (
                                <Image
                                    wrapperStyle={{
                                        display: 'none',
                                    }}
                                    preview={{
                                        visible: previewOpenImageUrl,
                                        onVisibleChange: (visible) => setPreviewOpenImageUrl(visible),
                                        afterOpenChange: (visible) => !visible && setPreviewImageUrl(''),
                                    }}
                                    src={previewImageUrl}
                                    fallback={imageNotFound}
                                />
                            )}
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

export default CreatePlan;
