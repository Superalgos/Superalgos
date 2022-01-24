import './App.css';
import Sidebar from "../sidebar/Sidebar";
import {Outlet, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import UsersSidebar from "../userSideBar/UsersSidebar";

function App() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.actualUser);
    let navigate = useNavigate();

    const loadUser = async () => {
        /*     if (user) return;
             let {data, result} = await getProfile().then(response => response.json());
             if (data.missingProfile) {
                  navigate("/signUp")
             }
             if (result === STATUS_OK) {
                 dispatch(setActualProfile(data))
             }*/
    }

    useEffect(() => {
        loadUser();
    }, [navigate]);

    return (
        <div className="app">
            {/*<Stack className="appContainer"
                   direction="row">*/}

            <Sidebar/>
            <Outlet className="middleSection"/>
            <UsersSidebar/>
            {/*</Stack>*/}
        </div>
    );
}

export default App;
