import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Flex, notification, Select } from 'antd';
import { IconDatabaseExport, IconLink, IconTrash } from '@tabler/icons-react';

import IconQuestion from '~/assets/icon/IconQuestion';
import { logoutAuthSuccess } from '~/redux/reducer/auth';
import imageLogoMongodb from '~/assets/image/mongodb-logo.svg';
import { requestAuthImportDatabase } from '~/services/database';
import router from '~/configs/routes';

const OPTIONS = [];

function DatabaseImport() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const inputRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleChangeFileData = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleImportDatabase = async () => {
        if (!selectedItem) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng chọn dữ liệu muốn nhập',
            });
        }
        if (!file) {
            return notification.error({
                message: 'Thông báo',
                description: 'Vui lòng tải dữ liệu muốn nhập lên',
            });
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        const result = await requestAuthImportDatabase(selectedItem, formData);

        setLoading(false);
        if (result.status === 401 || result.status === 403) {
            dispatch(logoutAuthSuccess());
            navigate(`${router.login}?redirect_url=${pathname}`);
        } else if (result?.status === 200) {
            setFile(null);
            setSelectedItem(null);

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
        <Badge.Ribbon
            text={
                <IconQuestion
                    width={14}
                    height={14}
                    className="text-subtitle mr-3"
                    title="Nếu dữ liệu quá nhiều gây timeout, bạn có thể tải lên nhiều lần."
                />
            }
            color="transparent"
        >
            <div className="database_item flex-column p-0">
                <Flex align="center" justify="center" className="w-full">
                    <div className="font-semibold font-size-18 pt-3">Nhập dữ liệu</div>
                </Flex>
                <Flex align="center" justify="center" className="w-full gap-3 py-3">
                    <img src={imageLogoMongodb} width={40} height={40} style={{ objectFit: 'contain' }} alt="Database" />

                    <div className="database_item-title width-max-content">MongoDB</div>
                </Flex>

                <div className="p-2 w-full">
                    <Select
                        className="text-subtitle w-full text-center"
                        placeholder="Chọn dữ liệu muốn nhập"
                        value={selectedItem}
                        onChange={setSelectedItem}
                        options={OPTIONS.map((item) => ({
                            value: item,
                            label: item,
                        }))}
                    />

                    <div className="text-center my-3">
                        <input type="file" accept=".json" ref={inputRef} hidden onChange={handleChangeFileData} />

                        <Button block type="dashed" icon={<UploadOutlined />} onClick={() => inputRef.current.click()}>
                            Chọn file
                        </Button>

                        {file && (
                            <Flex align="center" justify="center" className="my-2 gap-1">
                                <IconLink size={16} />
                                <span>{file.name}</span>
                                <IconTrash size={16} className="hover-red ml-1" onClick={() => setFile(null)} />
                            </Flex>
                        )}
                    </div>

                    <Button type="primary" loading={loading} block onClick={handleImportDatabase}>
                        {loading ? (
                            'Loading...'
                        ) : (
                            <div className="box-center gap-1">
                                <IconDatabaseExport size={18} />
                                <span>Nhập dữ liệu</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </Badge.Ribbon>
    );
}

export default DatabaseImport;
