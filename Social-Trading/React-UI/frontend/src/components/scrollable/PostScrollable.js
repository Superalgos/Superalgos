import React, {useState} from 'react';
import "./PostScrollable.css"

const PostScrollable = props => {

    const pageSize = 20;
    const [posts, setPosts] = useState(true);
    const [page, setPage] = useState(true);
    const [prevY, setPrevY] = useState(true);
    const [loading, setLoading] = useState(true);


    return (
        <div>

        </div>
    );
};

PostScrollable.propTypes = {};

export default PostScrollable;
