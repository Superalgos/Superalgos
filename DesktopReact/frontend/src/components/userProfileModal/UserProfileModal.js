import React, {useEffect, useState} from 'react';
import {useDispatch} from "react-redux";
import {setActualProfile} from "../../store/slices/Profile.slice";
import {updateProfile} from "../../api/profile.httpService";
import UserProfileModalView from './UserProfileModalView'

const UserProfileModal = ({user, close}) => {
    const dispatch = useDispatch();
    const [errorState, setErrorState] = useState(false);
    const [userInfo, setUserInfo] = useState(user);

    useEffect(() => {
        setUserInfo(user);
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
        let {result} = await updateProfile(userInfo).then( response => response.json() );
        if (result === STATUS_OK) {
            dispatch( setActualProfile(userInfo) );
            close();
        }
    }

    const isEquals = () => {
        let differentKey = Object.keys(user).find(key => user[key] !== userInfo[key]);
        return !differentKey;
    }

    return <UserProfileModalView
        userInfo = {userInfo}
        handleChange = {handleChange}
        selectProfilePic = {selectProfilePic}
        selectBannerPic = {selectBannerPic}
        saveProfile = {saveProfile}
        isEquals = {isEquals}
        errorState = {errorState}
        close = {close} 
     />
}

export default UserProfileModal