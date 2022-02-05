import React, {useEffect, useState} from 'react';
import "./Signup.css"
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {updateProfile} from "../../api/profile.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import {setActualProfile} from "../../store/slices/Profile.slice";
import SignupView from "./SignupView";

const Signup = () => {
    const [errorState, setErrorState] = useState(true);
    const [inputCharNumber, setInputCharNumber] = useState(false);
    const [userInfo, setUserInfo] = useState(useSelector(state => state.profile.actualUser));
    // Stepper Component
    const steps = [/*'Enter your username', 'Additional p*/'Profile data'];
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
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
        let profileData = {
            ...userInfo, joined: new Date().getTime(), originSocialPersonaId: userInfo.nodeId
        };
        console.log({profileData})
        let {result} = await updateProfile(profileData).then(response => response.json());
        console.log({result})
        if (result === STATUS_OK) {
            dispatch(setActualProfile(userInfo));
            navigate("/");
        }
    }

    const isStepOptional = (step) => {
        return step === 1;
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return <SignupView
        errorState={errorState}
        inputCharNumber={inputCharNumber}
        userInfo={userInfo}
        selectProfilePic={selectProfilePic}
        selectBannerPic={selectBannerPic}
        handleChange={handleChange}
        saveProfile={saveProfile}
        steps={steps}
        activeStep={activeStep}
        skipped={skipped}
        isStepOptional={isStepOptional}
        isStepSkipped={isStepSkipped}
        handleNext={handleNext}
        handleBack={handleBack}
        handleSkip={handleSkip}
        handleReset={handleReset}
    />
};

export default Signup;