import React from 'react';
import {Box, Modal} from "@mui/material";

const UserProfileModal = ({show}) => {
    return (
        <div>
            <Modal open={show}
            >
                <Box>
                    Hello
                </Box>
            </Modal>
        </div>
    );
};

export default UserProfileModal;