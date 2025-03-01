import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Image, Input, InputNumber, Row, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { checkImage, configGetBase64 } from '~/configs';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageNotFound from '~/assets/image/image_not.jpg';
import { requestAuthUpdateCloudServerRegion } from '~/services/cloudServer';

const { TextArea } = Input;

function UpdateRegion({ open, setOpen, region, callback, setCallback }) {
    const [imageUrl, setImageUrl] = useState([]);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [previewOpenImageUrl, setPreviewOpenImageUrl] = useState(false);

    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            try {
                const url = await checkImage(region.image_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }
        };
        fetch();
    }, [region]);

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

    const handleUpdateRegion = async (values) => {
        const { title, priority, description } = values;

        if (!region.key) {
            return notification.error({ message: 'Thông báo', description: 'Không thể lấy được ID khu vực' });
        }

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length < 1) {
            return notification.error({ message: 'Thông báo', description: 'Vui lòng chọn tải ảnh khu vực' });
        }

        const data = {
            title,
            priority,
            description,
            image_url: image_url[0],
        };

        const result = await requestAuthUpdateCloudServerRegion(region.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneRegions = [...callback];

            const regionIndex = cloneRegions.findIndex((server) => server.key === region.key);
            if (regionIndex === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy khu vực trong danh sách',
                });
            }

            cloneRegions[regionIndex] = result.data;
            setCallback(cloneRegions);

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
            title="Chi tiết khu vực"
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
                onFinish={handleUpdateRegion}
                initialValues={{
                    title: region.title,
                    priority: region.priority,
                    description: region.description,
                }}
            >
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item name="title" label="Tên khu vực" rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}>
                            <Input placeholder="Tên khu vực" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="priority" label="Độ ưu tiên" rules={[{ required: true, message: 'Vui lòng nhập độ ưu tiên' }]}>
                            <InputNumber className="w-full" placeholder="Độ ưu tiên" />
                        </Form.Item>
                    </Col>
                    <Col md={24} xs={24}>
                        <Form.Item name="description" label="Mô tả">
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
                            Cập nhật
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default UpdateRegion;
