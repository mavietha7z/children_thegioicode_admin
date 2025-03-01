import { IconAdjustmentsCog } from '@tabler/icons-react';

import Setting from '../Setting';
import NotFound from '~/layouts/NotFound';

function OtherConfig() {
    return (
        <Setting
            keyTab="3"
            label={
                <span className="box-align-center gap-2 text-subtitle">
                    <IconAdjustmentsCog size={20} />
                    Cấu hình khác
                </span>
            }
        >
            <NotFound coming />
        </Setting>
    );
}

export default OtherConfig;
