import React, {useState} from 'react';
import {Box, Button, CardContent, Modal, TextField, Typography} from "@mui/material";
import "./UserProfileModal.css"
import {CloseOutlined} from "@mui/icons-material";

const UserProfileModal = ({user, show, close}) => {

    const [inputValue, setInputValue] = useState()
    const [postText, setPostText] = useState(undefined); // needed?
    const [errorText, setErrorText] = useState(undefined);
    const [errorState, setErrorState] = useState(undefined);


    const handleChange = (event) => {
        setPostText(event.target.value);
        if (!event.target.value) {
            setErrorState(true)
            setErrorText("Name can't be blank")
        } else {
            setErrorState(false)
            setErrorText("")
        }
    }
    const handleClick = () => { // todo use condition or handle buttons separately
        console.log("Hello From change avatar & banner")
    }

    return (<>
        {show ? <Modal open={show}
                       onClose={close}
        >
            <Box className="editUserBox">
                <div>
                    <CardContent className="userSection">
                        <div className="editProfileHeader">
                            <div className="editProfileCloseBtn">
                                <CloseOutlined onClick={close}/>
                            </div>
                            <div className="editProfileHeaderTitleAndBtn">
                                <Typography className="editProfileTitle" variant="h5">
                                    Edit Profile
                                </Typography>
                            </div>
                        </div>
                        <div className="editBannerAvatarContainer">
                            <div>
                                <CardMedia className="banner"
                                           component="img"
                                           src={`data:image/png;base64,${user.bannerPic}`}
                                           alt="PP"
                                />
                                <div className="editAvatar">
                                    <div className="profileCard">
                                        <div className="profilePicBG">
                                            <CardMedia className="profileAvatar"
                                                       component="img"
                                                       src={`data:image/png;base64,${user.profilePic}`}
                                                       alt="ProfilePic"
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                className="userProfileAvatarButton"
                                                variant="outlined"
                                                onClick={handleClick}
                                            >Profile pic</Button>
                                            <Button
                                                className="userProfileAvatarButton"
                                                variant="outlined"
                                                onClick={handleClick}
                                            >Banner pic</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Name"
                                       error={errorState}
                                       defaultValue={user.name}
                                       helperText={errorText} // only show when input is empty
                                       onChange={handleChange}
                            />
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Bio"
                                       defaultValue={user.bio} // show the actual value, hardcoded ftm
                                       helperText={inputValue} // only show when input is empty
                            />
                        </div>
                        <div className="editProfile">
                            <Typography
                                className="editProfileTitles">Location</Typography> {/* todo use api for location */}
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="locatio"
                                       defaultValue={user.location} // show the actual value, hardcoded ftm
                                       helperText={inputValue} // only show when input is empty
                            />
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label=""
                                       defaultValue={user.web} // show the actual value
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
    </>);
};

export default UserProfileModal;