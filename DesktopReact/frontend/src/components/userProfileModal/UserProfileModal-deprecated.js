import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    CardContent,
    CardMedia,
    FormControl,
    FormHelperText,
    InputLabel,
    Modal,
    OutlinedInput,
    Typography
} from "@mui/material";
import "./UserProfileModal.css"
import {CloseOutlined, Input} from "@mui/icons-material";
import styled from "@emotion/styled";
import {updateProfile} from "../../api/profile.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import pfp from "../../images/superalgos.png";
import {useDispatch} from "react-redux";
import {setActualProfile} from "../../store/slices/Profile.slice";

const UserProfileModal = ({user, close}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        return () => setUserInfo(user);
    }, []);

    const Input = styled('input')({
        display: 'none',
    });

    const [errorState, setErrorState] = useState(false);
    const [userInfo, setUserInfo] = useState(user);
    const inputCharLimit = [{name: 50, bio: 150, location: 30, web: 100}] // temporal char limiter constant. Use json file instead?

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const selectProfilePic = async (e) => {
        let profilePic = e.target.files[0];
        if (profilePic) {
            let newInfo = {...userInfo};
            newInfo.profilePic = await toBase64(profilePic);
            setUserInfo(newInfo)
        }
    }

    const selectBannerPic = async (e) => {
        let bannerPic = e.target.files[0];
        if (bannerPic) {
            let newInfo = {...userInfo};
            newInfo.bannerPic = await toBase64(bannerPic);
            setUserInfo(newInfo)
        }
    }

    const handleChange = (event) => { // todo if reached max chars give warning message/indicator
        let newValue = event.target.value;
        let field = event.target.id;
        setErrorState(field === 'name' && (!newValue));
        setUserInfo({
            ...userInfo,
            [field]: newValue
        });
    }

    const saveProfile = async () => {
        let {result} = await updateProfile(userInfo).then(response => response.json());
        if (result === STATUS_OK) {
            dispatch(setActualProfile(userInfo));
            close();
        }
    }

    const isEquals = () => {
        let differentKey = Object.keys(user).find(key => user[key] !== userInfo[key]);
        return !differentKey;
    }

    return (
        <Modal open
               onClose={close}>
            <Box className="editUserBox" component="form" noValidate autoComplete="off">
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
                                   src={user.bannerPic || pfp}
                                   alt="PP"/>
                        <div className="editAvatar">
                            <div className="profileCard">
                                <div className="profilePicBG">
                                    <CardMedia className="profileAvatar"
                                               component="img"
                                               src={user.profilePic || pfp}
                                               alt="ProfilePic"/>
                                </div>
                                <label htmlFor="profilePic">
                                    <Input className="input" accept="image/*" id="profilePic" multiple type="file"
                                           onChange={selectProfilePic}/>
                                    <Button variant="outlined" component="span">
                                        Upload Profile Picture
                                    </Button>
                                </label>
                                <div>
                                    <label htmlFor="bannerPic">
                                        <Input className="input" accept="image/*" id="bannerPic" multiple type="file"
                                               onChange={selectBannerPic}/>
                                        <Button variant="outlined" component="span">
                                            Upload Banner Picture
                                        </Button>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="editProfileInputBoxes">
                            <FormControl className="editProfile" required error={errorState}>
                                <InputLabel htmlFor="name">Name</InputLabel>
                                <OutlinedInput
                                    id="name"
                                    value={userInfo.name}
                                    onChange={handleChange}
                                    label="Name"
                                    inputProps={{maxLength: inputCharLimit[0].name}}
                                />
                                {errorState ? (
                                    <FormHelperText id="name-error">Name can't be blank</FormHelperText>
                                ) : null}
                            </FormControl>
                            <FormControl className="editProfile">
                                <InputLabel htmlFor="bio">bio</InputLabel>
                                <OutlinedInput
                                    id="bio"
                                    value={userInfo.bio}
                                    onChange={handleChange}
                                    label="Bio"
                                    inputProps={{maxLength: inputCharLimit[0].bio}}
                                />
                            </FormControl>
                            <FormControl className="editProfile">
                                <InputLabel htmlFor="location">location</InputLabel>
                                <OutlinedInput
                                    id="location"
                                    value={userInfo.location}
                                    onChange={handleChange}
                                    label="Location"
                                    inputProps={{maxLength: inputCharLimit[0].location}}
                                />
                            </FormControl>
                            <FormControl className="editProfile">
                                <InputLabel htmlFor="web">Web</InputLabel>
                                <OutlinedInput
                                    id="web"
                                    value={userInfo.web}
                                    onChange={handleChange}
                                    label="Web"
                                    inputProps={{maxLength: inputCharLimit[0].web}}
                                />
                            </FormControl></div>
                        <div className="editProfileFooter">
                            <Button disabled={errorState || isEquals()} onClick={saveProfile}
                                    variant="outlined">Save</Button>
                        </div>
                    </div>
                </CardContent>
            </Box>
        </Modal>
    );
};

export default UserProfileModal;