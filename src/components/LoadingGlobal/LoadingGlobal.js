import { Spin } from 'antd';

function LoadingGlobal({ children }) {
    return (
        <Spin tip="Loading...">
            <div style={{ padding: 50, background: 'rgba(0, 0, 0, 0.05)', borderRadius: 5 }}>{children}</div>
        </Spin>
    );
}

export default LoadingGlobal;
