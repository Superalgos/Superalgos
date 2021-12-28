import './Feed.css';
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import React, {useEffect, useState} from "react";

const Feed = () => {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadPosts = async () => {
        setLoading(true)
        let {data, result} = await getPosts().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedPosts = data.map((post, index) => {
                    if (post.eventType !== 10) {
                        /* TODO add other post types*/
                        return;
                    }
                    return <Post key={index} id={index}
                                 postData={post}/>
                }
            );
            setPosts(mappedPosts);
        }
        setLoading(false);
    }

    useEffect(() => {
        return loadPosts();
    }, []);

    return (
        <div className="feed">
            <PostPlaceholder/>
            <PostsFeed posts={posts} loading={loading}/>
        </div>
    );
}

export default Feed;
