import React from 'react';
import {
    Box,
    Button,
    CardContent,
    CardMedia,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    Modal,
    OutlinedInput,
    Typography
} from "@mui/material";
import styled from "@emotion/styled";
import "./UserProfileModal.css"
import {CloseOutlined, Input} from "@mui/icons-material";
import pfp from "../../images/superalgos.png";
import AvatarEditor from "react-avatar-editor";

const UserProfileModalView = (props) => {
    const {
        userInfo,
        handleChange,
        selectProfilePic,
        selectBannerPic,
        saveProfile,
        isEquals,
        errorState,
        close,
        modalEditAvatar,
        handleClickCallback,
        avatarEditor,
        handleNewImage,
        handleScale,
        handlePositionChange,
        setEditorRef
    } = props;
    const inputCharLimit = [{name: 50, bio: 150, location: 30, web: 100}] // temporal char limiter constant. Use json file instead?
    const Input = styled('input')({
        display: 'none',
    });

    const formHeader = () => {
        return (
            <div className="editProfileHeader">
                <div className="editProfileCloseBtn">
                    <IconButton onClick={close}>
                        <CloseOutlined/>
                    </IconButton>
                </div>
                <div className="editProfileHeaderTitleAndBtn">
                    <Typography className="editProfileTitle" variant="h5">
                        Edit Profile
                    </Typography>
                </div>
            </div>
        )
    }

    const setBanner = () => {
        return <CardMedia className='banner'
                          alt='banner'
                          src={userInfo.bannerPic ? `${userInfo.bannerPic}` : pfp}
                          component='img'/>
    }

    const profilePicSetter = () => {
        return <div className="profilePicBG">
            <CardMedia
                className='profileAvatar'
                alt='ProfilePic'
                src={userInfo.profilePic ? `${userInfo.profilePic}` : pfp}
                component='img'/>
        </div>
    }

    const profilePic = () => {
        return <label htmlFor="profilePic">
            <Input className="input" accept="image/*" id="profilePic" multiple type="file"
                   onChange={selectProfilePic}
            />
            <Button className="profilePicButtons" variant="outlined" component="span">
                Upload Profile Picture
            </Button>
        </label>
    }

    const bannerPic = () => {
        return <div>
            <label htmlFor="bannerPic">
                <Input className="input" accept="image/*" id="bannerPic" multiple type="file"
                       onChange={selectBannerPic}/>
                <Button className="profilePicButtons" variant="outlined" component="span">
                    Upload Banner Picture
                </Button>
            </label>
        </div>
    }

    const avatarContainer = () => {
        return <div className="editAvatar">
            <div className="profileCard">
                {profilePicSetter()}
                {profilePic()}
                {bannerPic()}
            </div>
        </div>
    }

    const formFields = () => {
        return (
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
                    <InputLabel htmlFor="bio">Bio</InputLabel>
                    <OutlinedInput
                        id="bio"
                        value={userInfo.bio}
                        onChange={handleChange}
                        label="Bio"
                        inputProps={{maxLength: inputCharLimit[0].bio}}
                    />
                </FormControl>
                <FormControl className="editProfile">
                    <InputLabel htmlFor="location">Location</InputLabel>
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
                </FormControl>
            </div>
        )
    }

    const formSaveButton = () => {
        return (
            <div className="editProfileFooter">
                <Button disabled={errorState || isEquals()} onClick={saveProfile}
                        variant="outlined">Save
                </Button>
            </div>
        )
    }

    return (<>
            <Modal open={modalEditAvatar}
                   onClose={handleClickCallback}>
                <Box className="editProfileAvatar">
                    <div className="editProfileAvatarHeader">
                        <IconButton onClick={handleClickCallback}>
                            <CloseOutlined/>
                        </IconButton>
                        <Typography>
                            Edit media
                        </Typography>
                        <Button
                            className="editProfileAvatarHeaderApplyButton"
                            onClick={handleNewImage}>
                            Apply
                        </Button>
                    </div>
                    <AvatarEditor className="reactAvatarEditor"
                                  image={avatarEditor.image}
                                  width={avatarEditor.width}
                                  height={avatarEditor.height}
                                  borderRadius={avatarEditor.borderRadius}
                                  scale={parseFloat(avatarEditor.scale)}
                                  position={avatarEditor.position}
                                  onPositionChange={handlePositionChange}
                                  ref={setEditorRef}
                    />
                    Zoom:
                    <input
                        name="scale"
                        type="range"
                        onChange={handleScale}
                        min={avatarEditor.allowZoomOut ? '0.1' : '1'}
                        max="2"
                        step="0.01"
                        defaultValue="1"
                    />
                </Box>
            </Modal>
            <Modal open
                   onClose={close}>
                <Box className="editUserBox" component="form" noValidate autoComplete="off">
                    <CardContent className="userSection">
                        {formHeader()}
                        <div className="editBannerAvatarContainer">
                            {setBanner()}
                            {avatarContainer()}
                            {formFields()}
                            {formSaveButton()}
                        </div>
                    </CardContent>
                </Box>
            </Modal>
        </>
    );
}

export default UserProfileModalView