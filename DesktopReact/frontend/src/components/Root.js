import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import App from './home/App';
import UserProfile from "./userProfile/UserProfile";
import NotFound from "./notFound/NotFound";
import Feed from "./feed/Feed";
import PostPlaceholder from "./postPlaceholder/PostPlaceholder";
import Post from "./post/Post";
import {getProfile} from "../api/profile.httpService";
import {STATUS_OK} from "../api/httpConfig";
import {setActualProfile} from "../store/slices/Profile.slice";
import {useDispatch, useSelector} from "react-redux";

const Root = () => {

    const dispatch = useDispatch();
    const user = useSelector(state => state.actualUser);

    const loadUser = async () => {
        if (user) return;
        let {data, result} = await getProfile().then(response => response.json());
        console.log({data, result})
        if (result === STATUS_OK) {
            dispatch(setActualProfile(data))
        }
    }

    useEffect(() => {
        loadUser();
    }, []);


    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App/>}>
                    <Route path='' element={<Feed/>}/>
                    <Route path='Profile' element={<UserProfile/>}>
                        <Route path=':userId' element={<UserProfile/>}/>
                    </Route>
                    <Route path='PostPlaceholder' element={<PostPlaceholder/>}/>
                    <Route path='post'>
                        <Route path={':postId'} element={<Post/>}/> {/* TODO handle this post data*/}
                    </Route>
                </Route>
                <Route
                    path="*"
                    element={
                        <NotFound/>
                    }
                />
            </Routes>
        </BrowserRouter>)
}

export default Root;