import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './login.css';
import './style.css';
import './custom.css';
import { privateRoutes } from './routes';
import DefaultLayout from './layouts/DefaultLayout';
import LoadingGlobal from './components/LoadingGlobal';

function App() {
    const { isLoading } = useSelector((state) => state.loading);

    return (
        <div className="css-app ant-app">
            <Router>
                <Routes>
                    {privateRoutes.map((route, index) => {
                        let Layout = DefaultLayout;

                        if (route.layout) {
                            Layout = route.layout;
                        } else if (route.layout === null) {
                            Layout = Fragment;
                        }

                        let Loading = Fragment;
                        if (isLoading) {
                            Loading = LoadingGlobal;
                        }

                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <Loading>
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    </Loading>
                                }
                            />
                        );
                    })}
                </Routes>
            </Router>
        </div>
    );
}

export default App;
