import './Feed.css';
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import PostsFeed from "../postsFeed/PostsFeed";
import {getFeed} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import React, {useEffect, useState} from "react";
import {Divider} from "@mui/material";
import {getProfile} from "../../api/profile.httpService";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        setLoading(true)
        getFeed().then(promiseResponse => {
            const mappedPosts = [];
            let parsedPromiseResponse = promiseResponse.json();
            parsedPromiseResponse.then(response => {
                const {data, result} = response
                if (result === STATUS_OK) {
                    data.map((post, index) => {
                        getProfile(post.originSocialPersonaId).then(response => {
                            const {result, data} = response.json();
                            if (result === STATUS_OK) post.profilePic = data.profilePic;
                            if (post.eventType === 10) {
                                mappedPosts.push(<Post key={Math.random()} id={index} postData={post}/>)
                            }
                        });
                    })
                    setPosts(mappedPosts);
                }
                setLoading(false);
            })
        })
    }

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <div className="feed">
            <div className="feedContainer">
                <PostPlaceholder reloadPostCallback={loadPosts}/>
            </div>
            <Divider flexItem/>
            <PostsFeed posts={posts} loading={loading}/>
        </div>
    );
}

export default Feed;
