import React, {useEffect, useState} from 'react';
import "./Signup.css"
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    FormHelperText,
    InputLabel,
    Modal,
    OutlinedInput,
    Typography
} from "@mui/material";
import {CloseOutlined, Input, LoginOutlined} from "@mui/icons-material";

const Signup = () => {
    const [errorState, setErrorState] = useState(false);
    const [inputCharNumber, setInputCharNumber] = useState(false);
    const inputCharLimit = [{name: 50, bio: 150, location: 30, web: 100}] // temporal char limiter constant. Use json file instead?

    const handleClick = () => {
        console.log("Signed up")
    }
    const handleChange = (event) => { // todo the name field must not be empty, and if reached max chars give warning message/indicator
        /*let newValue = event.target.value;
        let field = event.target.id;
        setErrorState(field === 'name' && (!newValue));
        setUserInfo({
            ...userInfo,
            [field]: newValue
        });*/
        setInputCharNumber(event.target.value.length) // if a field is filled with error, changing of input and adding more chars clears the error because of the use of one state handler
    }

    return (
        <>
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
                            <div className="signupInputBoxesContainer">
                                <FormControl className="signupFormControl" required error={errorState}>
                                    <InputLabel htmlFor="name">Name</InputLabel>
                                    <OutlinedInput
                                        id="name"
                                        /*value={userInfo.name}*/
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
                                        /*value={userInfo.bio}*/
                                        onChange={handleChange}
                                        label="Bio"
                                        inputProps={{maxLength: inputCharLimit[0].bio}}
                                    />
                                </FormControl>
                                <FormControl className="signupFormControl">
                                    <InputLabel htmlFor="location">location</InputLabel>
                                    <OutlinedInput
                                        id="location"
                                        /*value={userInfo.location}*/
                                        onChange={handleChange}
                                        label="Location"
                                        inputProps={{maxLength: inputCharLimit[0].location}}
                                    />
                                </FormControl>
                                <FormControl className="signupFormControl">
                                    <InputLabel htmlFor="web">Web</InputLabel>
                                    <OutlinedInput
                                        id="web"
                                        /*value={userInfo.web}*/
                                        onChange={handleChange}
                                        label="Web"
                                        inputProps={{maxLength: inputCharLimit[0].web}}
                                    />
                                </FormControl></div>
                            <div className="signupFooter">
                                {/*<Button disabled={errorState || isEquals()} onClick={saveProfile}
                                variant="outlined">Save</Button>*/}
                                <Button
                                    variant="outlined"
                                    startIcon={<LoginOutlined/>}
                                    onClick={handleClick}>
                                    Sign up
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Signup;