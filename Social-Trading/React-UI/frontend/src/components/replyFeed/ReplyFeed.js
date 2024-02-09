import React, {useEffect, useState} from 'react';
import './ReplyFeed.css'
import {useLocation, useNavigate} from "react-router-dom";
import ReplyFeedView from "./ReplyFeedView";
import {getPost, getReplies} from "../../api/post.httpService";
import {getProfile} from '../../api/profile.httpService'
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import {Skeleton} from "@mui/material";

const ReplyFeed = () => {
    const [post, setPost] = useState(undefined);
    const [loadingPost, setLoadingPost] = useState(false);
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

    useEffect(() => {
        loadPost();
        loadReplies();
    }, [])

    const goBack = () => navigate(-1); /* TODO improve this cause it breaks on multiple navigation*/

    const loadPostCreator = async (socialPersonaId) => {
        const {data, result} = await getProfile({socialPersonaId: socialPersonaId}).then(response => response.json());
        if (result === STATUS_OK) {
            return data;
        }
    }

    const assemblePostInfo = (post, creator) => {
        return {
            postText: post.postText,
            originPostHash: post.originPostHash,
            reactions: post.reactions,
            postType: post.postType,
            repliesCount: post.repliesCount,
            creator: {
                name: creator.name,
                username: creator.userProfileHandle,
                profilePic: creator.profilePic,
                originSocialPersonaId: creator.originSocialPersonaId
            }
        }
    }

    const loadPost = async () => {
        setLoadingPost(true);
        const {result, data} = await getPost(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            const creator = await loadPostCreator(data.originSocialPersona.socialPersonaId);
            setPost(assemblePostInfo(data, creator));
        }
        setLoadingPost(false)
    }

    const loadReplies = async () => {

        const {result, data} = await getReplies(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            const mappdResponses = await Promise.all(
                data.map(async (post, index) => {
                    const creator = await loadPostCreator(post.originSocialPersona.socialPersonaId)
                    return <Post key={post.originPostHash}
                                 id={post.originPostHash}
                                 postData={assemblePostInfo(post, creator)}/>
                })
            )
            setMappedReplies(mappdResponses);
        }
    }

    if (post)
        return (
            <ReplyFeedView
                loading={loadingPost}
                selectedPost={post}
                goBack={goBack}
                callbackEvent={loadReplies}
                replies={mappedReplies}
            />
        );
    return <></>
};

export default ReplyFeed;