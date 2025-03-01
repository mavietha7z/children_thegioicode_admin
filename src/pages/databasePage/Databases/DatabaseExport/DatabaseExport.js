import JSZip from 'jszip';
import moment from 'moment';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Flex, notification, Select } from 'antd';
import { IconDatabaseExport, IconDownload } from '@tabler/icons-react';

import router from '~/configs/routes';
import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageLogoMongodb from '~/assets/image/mongodb-logo.svg';
import { requestAuthExportDatabase } from '~/services/database';

const OPTIONS = [
    'ApiKeys',
    'Apis',
    'Apps',
    'BonusPoints',
    'CartProducts',
    'Carts',
    'CloudServerImages',
    'CloudServerPartners',
    'CloudServerPlans',
    'CloudServerProducts',
    'CloudServerRegions',
    'Cycles',
    'Invoices',
    'Localbanks',
    'LoginHistories',
    'Memberships',
    'NewsFeeds',
    'Notifications',
    'OrderCloudServers',
    'Orders',
    'OrderTemplates',
    'Partners',
    'PartnerServices',
    'Paygates',
    'Players',
    'Pricings',
    'Requests',
    'ResourceAccounts',
    'ResourceCategories',
    'ResourceProducts',
    'Sources',
    'Templates',
    'Tokens',
    'Userbanks',
    'Users',
    'WalletHistories',
    'Wallets',
];

function DatabaseExport() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDownload, setIsDownload] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleExportDatabase = async () => {
        if (selectedItems.length < 1) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn ít nhất một dữ liệu để xuất',
            });
        }

        setLoading(true);
        const result = await requestAuthExportDatabase(selectedItems);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setData(result.data);
            setIsDownload(true);

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

    const handleDownloadDatabase = async () => {
        if (!data) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng xuất dữ liệu muốn tải xuống',
            });
        }

        const zip = new JSZip();

        // Lặp qua từng key trong object data
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const jsonData = JSON.stringify(data[key]);
                const blob = new Blob([jsonData], { type: 'application/json' });

                // Thêm mỗi file JSON vào ZIP với tên là key
                zip.file(`${key.toLowerCase()}.json`, blob);
            }
        }

        // Tạo tệp ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);

        // Tạo một thẻ a để tạo liên kết và tải về
        const a = document.createElement('a');
        a.href = url;
        a.download = `thegioicode_${moment(new Date()).format('DD-MM-YYYY_HH-mm-ss')}.zip`;
        document.body.appendChild(a);
        a.click();

        // Xóa thẻ a sau khi đã tải về
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setData(null);
        setIsDownload(false);
        setSelectedItems([]);
    };

    return (
        <Badge.Ribbon
            text={
                <IconQuestion
                    width={14}
                    height={14}
                    className="text-subtitle mr-3"
                    title="Nếu dữ liệu quá nhiều gây timeout, bạn có thể tải xuống nhiều lần."
                />
            }
            color="transparent"
        >
            <div className="database_item flex-column p-0">
                <Flex align="center" justify="center" className="w-full">
                    <div className="font-semibold font-size-18 pt-3">Xuất dữ liệu</div>
                </Flex>
                <Flex align="center" justify="center" className="w-full gap-3 py-3">
                    <img src={imageLogoMongodb} width={40} height={40} style={{ objectFit: 'contain' }} alt="Database" />

                    <div className="database_item-title width-max-content">MongoDB</div>
                </Flex>

                <div className="p-2 w-full">
                    <Select
                        className="text-subtitle w-full text-center mb-3"
                        mode="multiple"
                        placeholder="Chọn dữ liệu muốn xuất"
                        value={selectedItems}
                        onChange={setSelectedItems}
                        options={filteredOptions.map((item) => ({
                            value: item,
                            label: item,
                        }))}
                    />
                    {isDownload ? (
                        <Button type="primary" className="box-center gap-1" block onClick={handleDownloadDatabase}>
                            <IconDownload size={18} />
                            Tải xuống
                        </Button>
                    ) : (
                        <Button type="primary" loading={loading} block onClick={handleExportDatabase}>
                            {loading ? (
                                'Loading...'
                            ) : (
                                <div className="box-center gap-1">
                                    <IconDatabaseExport size={18} />
                                    <span>Xuất dữ liệu</span>
                                </div>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Badge.Ribbon>
    );
}

export default DatabaseExport;
