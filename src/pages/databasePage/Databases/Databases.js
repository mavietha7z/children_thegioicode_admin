import { useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Card, Col, Flex, Input, Row, Space } from 'antd';

import './database.css';
import router from '~/configs/routes';
import DatabaseExport from './DatabaseExport';
import DatabaseImport from './DatabaseImport';

function ExportDatabase() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Quản trị website - Quản trị dữ liệu database';
    }, []);

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
                                    title: 'Quản trị dữ liệu',
                                },
                            ]}
                        />
                    </Flex>
                    <Flex justify="end" className="responsive-item">
                        <Input prefix={<SearchOutlined />} style={{ width: 260 }} placeholder="Tìm kiếm" />
                    </Flex>
                </Flex>
            </Card>

            <Card style={{ minHeight: 'calc(-144px + 100vh)' }}>
                <Row style={{ margin: '0 -8px', rowGap: 16 }}>
                    <Col md={6} xs={24} style={{ padding: '0 8px' }}>
                        <DatabaseExport />
                    </Col>
                    <Col md={6} xs={24} style={{ padding: '0 8px' }}>
                        <DatabaseImport />
                    </Col>
                </Row>
            </Card>
        </Space>
    );
}

export default ExportDatabase;
