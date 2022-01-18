import React, {useEffect, useState} from 'react';
import "./Signup.css"
import {
    Button,
    Card,
    CardContent, CardMedia,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    Typography
} from "@mui/material";
import {LoginOutlined} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {updateProfile} from "../../api/profile.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import {setActualProfile} from "../../store/slices/Profile.slice";
import pfp from "../../images/superalgos.png";
import styled from "@emotion/styled";

const Signup = () => {
    const Input = styled('input')({
        display: 'none',
    });

    const [errorState, setErrorState] = useState(true);
    const [inputCharNumber, setInputCharNumber] = useState(false);
    const inputCharLimit = [{name: 50, bio: 150, location: 30, web: 100}] // temporal char limiter constant. Use json file instead?
    const [userInfo, setUserInfo] = useState(useSelector(state => state.profile.actualUser));
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isUserLoaded = () => {
        console.log(userInfo)
        let {name, bio, joined, profilePic, location, bannerPic} = userInfo;
        if (name || bio || joined || profilePic || location || bannerPic) return;
        // navigate('/');
    }

    useEffect(() => {
        isUserLoaded();
    }, []);


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


    const handleChange = (event) => { // todo the name field must not be empty, and if reached max chars give warning message/indicator
        let newValue = event.target.value;
        let field = event.target.id;
        console.log({field, newValue})
        setErrorState(field === 'name' && (!newValue));
        setUserInfo({
            ...userInfo,
            [field]: newValue
        });
        setInputCharNumber(event.target.value.length) // if a field is filled with error, changing of input and adding more chars clears the error because of the use of one state handler
    }

    const saveProfile = async () => {
        let profileData = {...userInfo, joined: new Date().getTime()};
        console.log({profileData})
        let {result} = await updateProfile(profileData).then(response => response.json());
        console.log({result})
        if (result === STATUS_OK) {
            dispatch(setActualProfile(userInfo));
            navigate("/");
        }
    }


    return (
        <div className="signupContainer">
            <Card className="signupCardContainer">
                <CardContent className="signupCardContent">
                    <div>
                        <div className="signupHeader">
                            <div className="signupTitleContainer">
                                <Typography className="signupTitle" variant="h5">
                                    Sign up today
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div>
                        {userInfo.bannerPic ?
                            (
                                <CardMedia className="banner"
                                           component="img"
                                           src={`${userInfo.bannerPic}`}
                                           alt="PP"/>
                            ) :
                            (
                                <CardMedia className="banner"
                                           component="img"
                                           image={pfp}
                                           alt="PP"
                                />
                            )}
                        <div className="profileCard">
                            <div className="profilePicBG">
                                {userInfo.profilePic ?
                                    (
                                        <CardMedia className="profileAvatar"
                                                   component="img"
                                                   src={`${userInfo.profilePic}`}
                                                   alt="ProfilePic"/>
                                    ) :
                                    (
                                        <CardMedia className="profileAvatar"
                                                   component="img"
                                                   image={pfp}
                                                   alt="ProfilePic"/>
                                    )}
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
                        <div className="signupInputBoxesContainer">
                            <FormControl className="signupFormControl"
                                         required
                                         error={errorState}
                            >
                                <InputLabel htmlFor="name">Name</InputLabel>
                                <OutlinedInput
                                    id="name"
                                    value={userInfo.name}
                                    onChange={handleChange}
                                    label="Name"
                                    inputProps={{maxLength: inputCharLimit[0].name}}
                                    error={inputCharNumber === inputCharLimit[0].name}
                                />
                                {errorState ? (
                                    <FormHelperText id="name-error">Name can't be blank</FormHelperText>
                                ) : null}
                            </FormControl>
                            <FormControl className="signupFormControl">
                                <InputLabel htmlFor="bio">bio</InputLabel>
                                <OutlinedInput
                                    id="bio"
                                    value={userInfo.bio}
                                    onChange={handleChange}
                                    label="Bio"
                                    inputProps={{maxLength: inputCharLimit[0].bio}}
                                />
                            </FormControl>
                            <FormControl className="signupFormControl">
                                <InputLabel htmlFor="location">location</InputLabel>
                                <OutlinedInput
                                    id="location"
                                    value={userInfo.location}
                                    onChange={handleChange}
                                    label="Location"
                                    inputProps={{maxLength: inputCharLimit[0].location}}
                                />
                            </FormControl>
                            <FormControl className="signupFormControl">
                                <InputLabel htmlFor="web">Web</InputLabel>
                                <OutlinedInput
                                    id="web"
                                    value={userInfo.web}
                                    onChange={handleChange}
                                    label="Web"
                                    inputProps={{maxLength: inputCharLimit[0].web}}
                                />
                            </FormControl></div>
                        <div className="signupFooter">
                            <Button
                                variant="outlined"
                                startIcon={<LoginOutlined/>}
                                disabled={errorState}
                                onClick={saveProfile}
                            >
                                Sign up
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;