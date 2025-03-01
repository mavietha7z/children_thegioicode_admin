import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { Drawer, Empty, Flex, Spin, Table } from 'antd';

import { convertCurrency } from '~/configs';

function CartDetail({ open, setOpen, cart }) {
    const [empty, setEmpty] = useState(true);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cart) {
            setEmpty(true);
            setLoading(true);
            setProducts(cart.products);
        }
    }, [cart]);

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'title',
            render: (data) => (
                <Fragment>
                    <div className="font-weight-bold font-size-16">{data.title}</div>
                    <div className="text-subtitle">{data.description}</div>
                </Fragment>
            ),
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'pricing',
            key: 'pricing',
            render: (data) => <span>{data.cycles.display_name}</span>,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Số tiền',
            key: 'price',
            render: (data) => (
                <Flex align="center" justify="space-between">
                    <div>
                        <span>{convertCurrency(data.pricing.price * data.quantity)}</span>
                        <span className="text-danger font-size-12 ml-2">-{data.pricing.discount}%</span>
                    </div>
                </Flex>
            ),
        },

        {
            title: 'Ngày tạo/cập nhật',
            key: 'date',
            render: (data) => (
                <Fragment>
                    <span>{moment(data.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                    <br />
                    <span>{moment(data.updated_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                </Fragment>
            ),
        },
    ];

    return (
        <Drawer
            title={`Giỏ hàng #${cart.id}`}
            width={1000}
            onClose={() => setOpen(false)}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
        >
            {loading && empty ? (
                <div>
                    <Table columns={columns} dataSource={products.map((product) => ({ key: product.id, ...product }))} pagination={false} />
                </div>
            ) : !loading && empty ? (
                <Flex style={{ height: '60vh' }} align="center" justify="center">
                    <Spin />
                </Flex>
            ) : (
                <Empty style={{ marginTop: 80 }} description="Lỗi lấy dữ liệu đơn hàng trong giỏ hàng" />
            )}
        </Drawer>
    );
}

export default CartDetail;
