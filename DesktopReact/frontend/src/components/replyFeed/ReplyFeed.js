import React, {useEffect, useState} from 'react';
import './ReplyFeed.css'
import {useLocation, useNavigate} from "react-router-dom";
import ReplyFeedView from "./ReplyFeedView";
import {getPost, getReplies} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import {Skeleton} from "@mui/material";

const ReplyFeed = () => {
    const [post, setPost] = useState({});
    const [mappedReplies, setMappedReplies] = useState([]);
    const navigate = useNavigate();
    const {search} = useLocation();
    const urlSearchParams = React.useMemo(() => new URLSearchParams(search), [search]);
    const queryParams = {
        targetPostHash: urlSearchParams.get("post"),
        targetSocialPersonaId: urlSearchParams.get("user")
    }

    const skeletons = [
        <Skeleton key={0} variant="rectangular" width="100%" height="12rem"/>,
        <Skeleton key={1} variant="rectangular" width="100%" height="12rem"/>
    ]

    const goBack = () => navigate(-1); /* TODO improve this cause it breaks on multiple navigation*/

    const loadPost = async () => {
        const {result, data} = await getPost(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            setPost(data)
        }
    }

    const loadReplies = async () => {
        let replies = [];
        const {result, data} = await getReplies(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            data.map((post, index) => {
                replies.push(<Post key={post.originPostHash} id={post.originPostHash} postData={post}/>);
            })
        }
        setMappedReplies(replies);
    }

    useEffect(() => {
        console.log("loading everything")
        loadPost();
        loadReplies();
        return () => {
            console.log("destroying everything")
            setMappedReplies([]);
            setPost({});
        }
    }, [urlSearchParams]);


    return (
        <ReplyFeedView
            selectedPost={post}
            goBack={goBack}
            replies={mappedReplies}
        />
    );
};

export default ReplyFeed;