import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Image, Input, notification, Row, Select, Upload } from 'antd';

import Setting from '../Setting';
import { urlUpload } from '~/utils';
import router from '~/configs/routes';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import { requestAuthGetInfoApps, requestAuthUpdateInfoApps } from '~/services/app';

function SettingInfo() {
    const [faviconUrl, setFaviconUrl] = useState('');
    const [websiteLogoUrl, setWebsiteLogoUrl] = useState('');
    const [backendLogoUrl, setBackendLogoUrl] = useState('');

    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();

    useEffect(() => {
        const fetch = async () => {
            const result = await requestAuthGetInfoApps();

            if (result.status === 401 || result.status === 403) {
                dispatch(logoutAuthSuccess());
                navigate(`${router.login}?redirect_url=${pathname}`);
            } else if (result?.status === 200) {
                const { favicon_url, website_logo_url, website_status, backend_logo_url, contacts } = result.data;

                setFaviconUrl(favicon_url);
                setWebsiteLogoUrl(website_logo_url);
                setBackendLogoUrl(backend_logo_url);

                form.setFieldValue('email', contacts.email);
                form.setFieldValue('address', contacts.address);
                form.setFieldValue('zalo_url', contacts.zalo_url);
                form.setFieldValue('tiktok_url', contacts.tiktok_url);
                form.setFieldValue('youtube_url', contacts.youtube_url);
                form.setFieldValue('website_url', contacts.website_url);
                form.setFieldValue('twitter_url', contacts.twitter_url);
                form.setFieldValue('facebook_url', contacts.facebook_url);
                form.setFieldValue('telegram_url', contacts.telegram_url);
                form.setFieldValue('phone_number', contacts.phone_number);
                form.setFieldValue('instagram_url', contacts.instagram_url);
                form.setFieldValue('website_status_status', website_status.status);
                form.setFieldValue('website_status_reason', website_status.reason);
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

    const handleUploadImageFavicon = async (info) => {
        if (info.file.status === 'done') {
            const url = info.file.response.data;
            setFaviconUrl(url);
        } else if (info.file.status === 'error') {
            notification.error({ message: 'Thông báo', description: info.file.response.error || 'Lỗi hệ thống vui lòng thử lại sau' });
        }
    };

    const handleUploadImageWebsiteLogo = async (info) => {
        if (info.file.status === 'done') {
            const url = info.file.response.data;
            setWebsiteLogoUrl(url);
        } else if (info.file.status === 'error') {
            notification.error({ message: 'Thông báo', description: info.file.response.error || 'Lỗi hệ thống vui lòng thử lại sau' });
        }
    };

    const handleUploadImageBackendLogo = async (info) => {
        if (info.file.status === 'done') {
            const url = info.file.response.data;
            setBackendLogoUrl(url);
        } else if (info.file.status === 'error') {
            notification.error({ message: 'Thông báo', description: info.file.response.error || 'Lỗi hệ thống vui lòng thử lại sau' });
        }
    };

    const handleUpdateConfigInfo = async (values) => {
        const {
            email,
            address,
            zalo_url,
            tiktok_url,
            twitter_url,
            website_url,
            youtube_url,
            facebook_url,
            phone_number,
            telegram_url,
            instagram_url,
            website_status_status,
            website_status_reason,
        } = values;

        const data = {
            contacts: {
                email,
                address,
                zalo_url,
                tiktok_url,
                twitter_url,
                website_url,
                youtube_url,
                facebook_url,
                phone_number,
                telegram_url,
                instagram_url,
            },
            favicon_url: faviconUrl,
            website_logo_url: websiteLogoUrl,
            backend_logo_url: backendLogoUrl,
            website_status: {
                status: website_status_status,
                reason: website_status_reason,
            },
        };

        const result = await requestAuthUpdateInfoApps(data);

        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            notification.success({
                message: 'Thông báo',
                description: result.message,
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: result.error || 'Lỗi hệ thống vui lòng thử lại sau',
            });
        }
    };

    return (
        <Setting
            keyTab="1"
            label={
                <span className="box-align-center gap-2 text-subtitle">
                    <IconInfoCircle size={20} />
                    Thông tin
                </span>
            }
        >
            <Row className="py-5" style={{ margin: '0 -8px', rowGap: 20 }}>
                <Col md={8} xs={24} style={{ padding: '0 8px' }} className="text-center">
                    <Image src={faviconUrl} alt="Favicon" style={{ maxWidth: 36, maxHeight: 36 }} />
                    <h2 className="mt-2 font-size-15">Favicon Icon</h2>
                    <Upload
                        action={urlUpload}
                        onChange={handleUploadImageFavicon}
                        withCredentials={true}
                        name="image"
                        showUploadList={false}
                    >
                        <Button size="small" type="dashed" className="mt-2">
                            Chọn ảnh
                        </Button>
                    </Upload>
                </Col>

                <Col md={8} xs={24} style={{ padding: '0 8px' }} className="text-center">
                    <Image src={websiteLogoUrl} alt="Website Logo" style={{ maxWidth: 140, maxHeight: 36 }} />
                    <h2 className="mt-2 font-size-15">Website Logo</h2>
                    <Upload
                        action={urlUpload}
                        onChange={handleUploadImageWebsiteLogo}
                        withCredentials={true}
                        name="image"
                        showUploadList={false}
                    >
                        <Button size="small" type="dashed" className="mt-2">
                            Chọn ảnh
                        </Button>
                    </Upload>
                </Col>

                <Col md={8} xs={24} style={{ padding: '0 8px' }} className="text-center">
                    <Image src={backendLogoUrl} alt="Backend Logo" style={{ maxWidth: 140, maxHeight: 36 }} />
                    <h2 className="mt-2 font-size-15">Backend Logo</h2>
                    <Upload
                        action={urlUpload}
                        onChange={handleUploadImageBackendLogo}
                        withCredentials={true}
                        name="image"
                        showUploadList={false}
                    >
                        <Button size="small" type="dashed" className="mt-2">
                            Chọn ảnh
                        </Button>
                    </Upload>
                </Col>
            </Row>

            <Form layout="vertical" form={form} onFinish={handleUpdateConfigInfo}>
                <Row gutter={16}>
                    <Col md={12} xs={24}>
                        <Form.Item
                            name="website_status_status"
                            label="Trạng thái trang"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái trang' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Chọn trạng thái"
                                options={[
                                    { label: 'Đang hoạt động', value: 'activated' },
                                    { label: 'Không hoạt động', value: 'inactivated' },
                                    { label: 'Đang bảo trì', value: 'maintenance' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="website_status_reason" label="Lý do trạng thái trang">
                            <Input size="large" placeholder="Lý do trạng thái trang" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="zalo_url" label="Zalo">
                            <Input size="large" placeholder="Zalo" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="facebook_url" label="Facebook">
                            <Input size="large" placeholder="Facebook" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="instagram_url" label="Instagram">
                            <Input size="large" placeholder="Instagram" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="website_url" label="Google">
                            <Input size="large" placeholder="Google" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="youtube_url" label="Youtube">
                            <Input size="large" placeholder="Youtube" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="tiktok_url" label="Tiktok">
                            <Input size="large" placeholder="Tiktok" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="telegram_url" label="Telegram">
                            <Input size="large" placeholder="Telegram" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="twitter_url" label="Twitter">
                            <Input size="large" placeholder="Twitter" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="email" label="Email">
                            <Input size="large" placeholder="Email" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="phone_number" label="SĐT">
                            <Input size="large" placeholder="SĐT" />
                        </Form.Item>
                    </Col>
                    <Col md={12} xs={24}>
                        <Form.Item name="address" label="Địa chỉ">
                            <Input size="large" placeholder="Địa chỉ" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary" size="large" htmlType="submit">
                            Lưu cấu hình
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Setting>
    );
}

export default SettingInfo;
