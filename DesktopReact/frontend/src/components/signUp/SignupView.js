import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    Typography
} from "@mui/material";
import {LoginOutlined} from "@mui/icons-material";
import styled from "@emotion/styled";

const SignupView = (props) => {
    const {
        errorState,
        inputCharNumber,
        userInfo,
        selectProfilePic,
        selectBannerPic,
        handleChange,
        saveProfile,
        steps,
        activeStep,
        skipped,
        isStepOptional,
        isStepSkipped,
        handleNext,
        handleBack,
        handleSkip,
        handleReset
    } = props;

    const inputCharLimit = [{name: 50, bio: 150, location: 30, web: 100}] // temporal char limiter constant. Use json file instead?

    const Input = styled('input')({
        display: 'none',
    });

    return (
        <div className="signupContainer">
            {activeStep === steps.length ? (
                <React.Fragment>
                    <Typography sx={{
                        mt: 2, mb: 1,
                        height: "100vh",
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        You have successfully signed up
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                        <Box sx={{flex: '1 1 auto'}}/>
                        <Button onClick={handleReset}>Reset</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Card className="signupCardContainer">
                        <CardContent className="signupCardContent">
                            <div className="signupHeader">
                                <div className="signupTitleContainer">
                                    <Typography className="signupTitle" variant="h5">
                                        Sign up today
                                    </Typography>
                                </div>
                            </div>
                            <div className="signupBody">
                                <div className="profileCard">
                                    <label htmlFor="profilePic">
                                        <Input className="input" accept="image/*" id="profilePic" multiple type="file"
                                               onChange={selectProfilePic}/>
                                        {
                                            activeStep === 0 ? (
                                                <Button className="signupPicButton" variant="outlined" component="span">
                                                    Upload Profile Picture
                                                </Button>) : null
                                        }
                                    </label>
                                    <div>
                                        <label htmlFor="bannerPic">
                                            <Input className="input" accept="image/*" id="bannerPic" multiple
                                                   type="file"
                                                   onChange={selectBannerPic}/>
                                            {
                                                activeStep === 0 ? (
                                                    <Button className="signupPicButton" variant="outlined"
                                                            component="span">
                                                        Upload Banner Picture
                                                    </Button>) : null
                                            }

                                        </label>
                                    </div>
                                </div>
                                {/* From control */}
                                <div className="signupInputBoxesContainer">
                                    {activeStep === 0 ? (
                                        <React.Fragment>
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
                                        </React.Fragment>
                                    ) : null}
                                    {activeStep === 0 ? (
                                        <React.Fragment>
                                            <FormControl className="signupFormControl">
                                                <InputLabel htmlFor="bio">Bio</InputLabel>
                                                <OutlinedInput
                                                    id="bio"
                                                    value={userInfo.bio}
                                                    onChange={handleChange}
                                                    label="Bio"
                                                    inputProps={{maxLength: inputCharLimit[0].bio}}
                                                />
                                            </FormControl>
                                            <FormControl className="signupFormControl">
                                                <InputLabel htmlFor="location">Location</InputLabel>
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
                                            </FormControl>
                                        </React.Fragment>
                                    ) : null}
                                </div>
                                <div className="signupFooter">
                                    {/* Stepper */}
                                    {/*
                                    <Stepper activeStep={activeStep}>
                                        {steps.map((label, index) => {
                                            const stepProps = {};
                                            const labelProps = {};
                                            if (isStepSkipped(index)) {
                                                stepProps.completed = false;
                                            }
                                            return (
                                                <Step key={label} {...stepProps}>
                                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                                </Step>
                                            );
                                        })}
                                    </Stepper>
*/}
                                </div>
                            </div>
                        </CardContent>
                        <Box sx={{display: 'flex', flexDirection: 'row', pt: 2, minWidth: "20rem", maxWidth: "40rem"}}>
                            {/*<Button
                                color="inherit"
                                disabled={activeStep === 5}
                                onClick={handleBack}
                                sx={{mr: 1}}
                            >Back
                            </Button>*/}
                            <Box sx={{flex: '1 1 auto'}}/>
                            {/* todo Loui: handle save profile func */}
                            <Button onClick={activeStep === 5 ? (handleNext) : saveProfile}
                                    disabled={errorState}
                                    startIcon={activeStep === 0 ? (<LoginOutlined/>) : null}
                            >
                                {activeStep === steps.length - 1 ? 'Sign Up' : 'Next'}
                            </Button>
                        </Box>
                    </Card>
                </React.Fragment>
            )}
        </div>
    );
};

export default SignupView;