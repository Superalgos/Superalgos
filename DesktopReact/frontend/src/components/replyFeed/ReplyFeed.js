import React, {useEffect, useState} from 'react';
import './ReplyFeed.css'
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ReplyFeedView from "./ReplyFeedView";
import {getPost, getReplies} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";

const ReplyFeed = ({}) => {
    const {search} = useLocation();
    let urlSearchParams = React.useMemo(() => new URLSearchParams(search), [search]);
    const [post, setPost] = useState({});
    const mappedReplies = [];
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    }
    const {postId, socialPersonaId} = useParams();

    const loadPost = async () => {
        let queryParams = {
            targetPostHash: urlSearchParams.get("post"),
            targetSocialPersonaId: urlSearchParams.get("user")
        }
        const {result, data} = await getPost(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            setPost(data)
        }
    }

    const loadReplies = async () => {

        let queryParams = {
            targetPostHash: urlSearchParams.get("post"),
            targetSocialPersonaId: urlSearchParams.get("user")
        }
        console.log(queryParams)
        const {result, data} = await getReplies(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            console.log(data)
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

    if(post.originSocialPersonaId)
    return (
        <ReplyFeedView
            selectedPost={post}
            goBack={goBack}
            replies={mappedReplies}
        />
    );
    return<></>
};

export default ReplyFeed;