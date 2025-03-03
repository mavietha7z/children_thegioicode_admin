import { Drawer, Image, Table } from 'antd';

import imageNotFound from '~/assets/image/image_not.jpg';

function RegionPlans({ open, setOpen, plans }) {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => `#${id}`,
        },
        {
            title: 'Tên máy chủ',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            render: (image_url) => <Image width={40} src={image_url} alt="Avatar" fallback={imageNotFound} className="border rounded-8" />,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
    ];

    return (
        <Drawer
            title="Máy chủ có trong khu vực"
            width={1000}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            <Table columns={columns} dataSource={plans.map((plan) => ({ key: plan.id, ...plan }))} pagination={false} />
        </Drawer>
    );
}

export default RegionPlans;
