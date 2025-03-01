import { SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Input, Space, Tabs } from 'antd';
import { IconAdjustmentsCog, IconArrowLeft, IconInfoCircle, IconMailCog } from '@tabler/icons-react';

import router from '~/configs/routes';
import SettingInfo from './SettingInfo';
import OtherConfig from './OtherConfig';
import SettingSendMail from './SettingSendMail';

function Setting({ label, keyTab, children }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const items = [
        {
            label: (
                <span className="box-align-center gap-2 text-subtitle">
                    <IconInfoCircle size={20} />
                    Thông tin
                </span>
            ),
            key: '1',
            children: <SettingInfo />,
        },
        {
            label: (
                <span className="box-align-center gap-2 text-subtitle">
                    <IconMailCog size={20} />
                    Gửi email
                </span>
            ),
            key: '2',
            children: <SettingSendMail />,
        },
        {
            label: (
                <span className="box-align-center gap-2 text-subtitle">
                    <IconAdjustmentsCog size={20} />
                    Cấu hình khác
                </span>
            ),
            key: '3',
            children: <OtherConfig />,
        },
    ];

    // Tìm và cập nhật tab được chỉ định từ props
    const tabIndex = items.findIndex((item) => item.key === keyTab);
    if (tabIndex !== -1) {
        items[tabIndex].label = label;
        items[tabIndex].children = children;
    } else {
        // Nếu keyTab không khớp, thêm tab mới vào cuối danh sách
        items.push({
            label: label,
            key: keyTab,
            children: children,
        });
    }

    const onChangeNavigate = (key) => {
        switch (key) {
            case '1':
                navigate(router.settings_info);
                break;
            case '2':
                navigate(router.settings_email);
                break;
            case '3':
                navigate(router.settings_other);
                break;
            default:
                navigate(pathname);
        }
    };

    return (
        <Space style={{ width: '100%', flexDirection: 'column' }}>
            <Card
                styles={{
                    body: {
                        padding: 12,
                    },
                }}
            >
                <Flex justify="space-between" align="center" className="responsive-flex">
                    <Flex className="gap-2 responsive-item">
                        <Button size="small" className="box-center" onClick={() => navigate(router.home)}>
                            <IconArrowLeft size={18} />
                        </Button>
                        <Breadcrumb
                            className="flex-1"
                            items={[
                                {
                                    title: <Link to={router.home}>Trang chủ</Link>,
                                },
                                {
                                    title: 'Cấu hình',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} style={{ width: 260 }} placeholder="Tìm kiếm" />
                    </Flex>
                </Flex>
            </Card>

            <Card styles={{ body: { paddingTop: 12 } }} style={{ minHeight: 'calc(-144px + 100vh)' }}>
                <Tabs activeKey={keyTab} items={items} onChange={onChangeNavigate} className="billing-tabs" />
            </Card>
        </Space>
    );
}

export default Setting;
