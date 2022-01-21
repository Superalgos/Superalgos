import React, {useEffect, useState} from 'react';
import './ReplyFeed.css'
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ReplyFeedView from "./ReplyFeedView";
import {getPost, getReplies} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";

const ReplyFeed = () => {
    const [post, setPost] = useState({});
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    const {search} = useLocation();
    const urlSearchParams = React.useMemo(() => new URLSearchParams(search), [search]);
    const mappedReplies = [];
    const queryParams = {
        targetPostHash: urlSearchParams.get("post"),
        targetSocialPersonaId: urlSearchParams.get("user")
    }

    const loadPost = async () => {
        const {result, data} = await getPost(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            setPost(data)
        }
    }

    const loadReplies = async () => {
        const {result, data} = await getReplies(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            data.map((post, index) => {
                if (post.eventType === 10) {
                    mappedReplies.push(<Post key={Math.random()} id={index} postData={post}/>)
                }
            })
        }
    }

    useEffect(() => {
        loadPost();
        loadReplies();
    }, []);

    return (
        <ReplyFeedView
            selectedPost={post}
            goBack={goBack}
            replies={mappedReplies}
        />
    );
 
};

export default ReplyFeed;