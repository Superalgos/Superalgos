import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import App from './home/App';
import UserProfile from "./userProfile/UserProfile";
import NotFound from "./notFound/NotFound";
import Feed from "./feed/Feed";
import PostPlaceholder from "./postPlaceholder/PostPlaceholder";


const Root = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App/>}>
                    <Route path='' element={<Feed/>}/>
                    <Route path='Profile' element={<UserProfile/>}>
                        {/*<Route path=':profileId' element={<UserProfile/>}/>*/}
                    </Route>
                    <Route path='Post' element={<PostPlaceholder/>}/>
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