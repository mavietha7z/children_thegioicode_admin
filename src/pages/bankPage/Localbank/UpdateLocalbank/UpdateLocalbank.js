import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Drawer, Flex, Form, Image, Input, Row, Select, Space, Upload, notification } from 'antd';

import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { checkImage, configGetBase64 } from '~/configs';
import imageNotFound from '~/assets/image/image_not.jpg';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthUpdateLocalbank } from '~/services/bank';

function LocalbankDetail({ open, setOpen, localbank, callback, setCallback }) {
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
                const url = await checkImage(localbank.logo_url);

                const filename = url.split('/').pop();
                const [name, extension] = filename.split('.');

                setImageUrl([{ uid: -1, name: `${name}.${extension}`, status: 'done', url }]);
            } catch (error) {
                setImageUrl([{ uid: -1, name: 'imageNotFound.png', status: 'done', url: imageNotFound }]);
            }
        };
        fetch();
    }, [localbank]);

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

    const handleUpdateLocalbank = async (values) => {
        const { code, type, full_name, interbank_code, sub_name } = values;

        let image_url = imageUrl.map((image) => image.url || image.response.data);
        if (image_url.length < 1) {
            return notification.error({ message: 'Thông báo', description: 'Vui lòng tải lên logo ngân hàng' });
        }

        const data = {
            code,
            type,
            sub_name,
            full_name,
            interbank_code,
            logo_url: image_url[0],
        };

        const result = await requestAuthUpdateLocalbank(localbank.key, 'info', data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            const cloneLocalBanks = [...callback];

            const indexLocalbank = cloneLocalBanks.findIndex((local) => local.key === localbank.key);
            if (indexLocalbank === -1) {
                return notification.error({
                    message: 'Thông báo',
                    description: 'Không tìm thấy ngân hàng trong danh sách',
                });
            }

            cloneLocalBanks[indexLocalbank] = result.data;
            setCallback(cloneLocalBanks);
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
            title="Chi tiết ngân hàng"
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
                onFinish={handleUpdateLocalbank}
                initialValues={{
                    code: localbank.code,
                    type: localbank.type,
                    sub_name: localbank.sub_name,
                    full_name: localbank.full_name,
                    interbank_code: localbank.interbank_code,
                }}
            >
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
                        <Form.Item label="Logo">
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
                            Tạo mới
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Drawer>
    );
}

export default LocalbankDetail;
