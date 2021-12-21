import React from 'react';
import {Box, Typography} from "@mui/material";

/* TODO Mode style to css if posible */
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const body = "Duis mollis, est non commodo luctus, nisi erat porttitor ligula."
const FooterReplyModal = () => {
    return (
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                Text in a modal
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                 {body}
            </Typography>
        </Box>
    );
};

export default FooterReplyModal;