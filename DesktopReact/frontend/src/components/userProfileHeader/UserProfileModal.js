import React, {useState} from 'react';
import {Box, Button, CardContent, Modal, TextField, Typography} from "@mui/material";
import "./UserProfileModal.css"
import {CloseOutlined} from "@mui/icons-material";

const style = { // todo need proper style
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40rem',
    height: '25.2rem',
    bgcolor: 'background.paper',
    border: '1px solid #000',
    boxShadow: 24,
};

const UserProfileModal = ({show, close}) => {

    const [inputValue, setInputValue] = useState()
    const handleInput = () => {
        if(inputValue === ""){

        }
    }
    return (
        <>
            {show ?
                <Modal open={show}
                       onClose={close}
                >
                    <Box sx={style}>
                        <div>
                            <CardContent className="userSection">
                                <div className="editProfileHeader">
                                    <div className="editProfileCloseBtn">
                                        <CloseOutlined/>
                                    </div>
                                    <div className="editProfileHeaderTitleAndBtn">
                                        <Typography className="editProfileTitle" variant="h5">
                                        Edit Profile
                                    </Typography>

                                    </div>
                                </div>
                                <div className="editProfile">
                                    <Typography className="styleASDASD" variant="subtitle2">
                                        <TextField className="editProfileInputBoxes"
                                            id="outlined-helperText"
                                            label="Name"
                                            defaultValue="This is my name" // show the actual value, hardcoded ftm
                                            helperText="" // only show when input is empty
                                        />
                                    </Typography>
                                </div>
                                <div className="editProfile">
                                    <TextField className="editProfileInputBoxes"
                                               id="outlined-helperText"
                                               label="Bio"
                                               defaultValue="This is my editable bio" // show the actual value, hardcoded ftm
                                               helperText={inputValue} // only show when input is empty
                                    />
                                </div>
                                <div className="editProfile">
                                    <Typography className="editProfileTitles">Location</Typography> {/* todo use api for location */}
                                    <Typography className="styleASDASD" variant="subtitle2">
                                        Editable City, Country
                                    </Typography>
                                </div>
                                <div className="editProfile">
                                    <TextField className="editProfileInputBoxes"
                                               id="outlined-helperText"
                                               label=""
                                               defaultValue="Website" // show the actual value
                                               helperText="" // not needed
                                    />
                                </div>
                                <div className="editProfileFooter">
                                    <Button variant="outlined">Save</Button>
                                </div>
                            </CardContent>
                        </div>
                    </Box>
                </Modal> : null}
        </>
    );
};

export default UserProfileModal;