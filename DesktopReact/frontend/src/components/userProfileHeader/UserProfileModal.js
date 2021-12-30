import React, {useState} from 'react';
import {Box, Button, CardContent, CardMedia, Modal, TextField, Typography} from "@mui/material";
import "./UserProfileModal.css"
import {CloseOutlined, Input} from "@mui/icons-material";
import styled from "@emotion/styled";


const UserProfileModal = ({user, show, close}) => {
    const Input = styled('input')({
        display: 'none',
    });
    const [errorText, setErrorText] = useState('');
    const [errorState, setErrorState] = useState(false);
    const [userInfo, setUserInfo] = useState(user);

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const selectProfilePic = (e) => {
        let profilePic = e.target.files[0];

        console.log(userInfo.profilePic)
        setUserInfo(async oldInfo => {
            let newInfo = {...oldInfo};
            newInfo.profilePic = await toBase64(profilePic);
            console.log( newInfo.profilePic)
            return newInfo;
        })
    }

    const selectBannerPic = (e) => {
        let bannerPic = e.target.files[0];

        setUserInfo(async oldInfo => {
            let newInfo = {...oldInfo};
            newInfo.bannerPic = await toBase64(bannerPic);
            return newInfo;
        })
    }

    const handleChange = (event) => {
        if (!event.target.value) {
            setErrorState(true)
            setErrorText("Name can't be blank")
        } else {
            setErrorState(false)
            setErrorText("")
        }
    }

    const saveProfile = () => {
        console.log(userInfo)

    }

    return (<>
        {show ? <Modal open={show}
                       onClose={close}>
            <Box className="editUserBox">
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
                        <CardMedia className="banner"
                                   component="img"
                                   src={`${userInfo.bannerPic}`}
                                   alt="PP"
                        />
                        <div className="editAvatar">
                            <div className="profileCard">
                                <div className="profilePicBG">
                                    <CardMedia className="profileAvatar"
                                               component="img"
                                               src={`${userInfo.profilePic}`}
                                               alt="ProfilePic"
                                    />
                                </div>
                                <label htmlFor="profilePic">
                                    <Input className="input" accept="image/*" id="profilePic" multiple type="file"
                                           onChange={selectProfilePic}/>
                                    <Button variant="contained" component="span">
                                        Upload Profile Picture
                                    </Button>
                                </label>
                                <div>
                                    <label htmlFor="bannerPic">
                                        <Input className="input" accept="image/*" id="bannerPic" multiple type="file"
                                               onChange={selectBannerPic}/>
                                        <Button variant="contained" component="span">
                                            Upload Banner Picture
                                        </Button>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Name"
                                       error={errorState}
                                       value={userInfo.name}
                                       helperText={errorText} // only show when input is empty
                                       onChange={e => handleChange(e, 'name')}
                            />
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Bio"
                                       value={userInfo.bio} // show the actual value, hardcoded ftm
                                       onChange={e => handleChange(e, 'name')}
                            />
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Location"
                                       value={userInfo.location} // show the actual value, hardcoded ftm
                                       onChange={e => handleChange(e, 'name')}
                            />
                        </div>
                        <div className="editProfile">
                            <TextField className="editProfileInputBoxes"
                                       id="outlined-helperText"
                                       label="Web"
                                       value={userInfo.web} // show the actual value
                                       onChange={e => handleChange(e, 'name')}
                            />
                        </div>
                        <div className="editProfileFooter">
                            <Button onClick={saveProfile} variant="outlined">Save</Button>
                        </div>
                    </div>
                </CardContent>
            </Box>
        </Modal> : null}
    </>);
};

export default UserProfileModal;