import './App.css';
import Sidebar from "../sidebar/Sidebar";
import {Outlet, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import UsersSidebar from "../userSideBar/UsersSidebar";
import {getSocialPersona} from "../../api/profile.httpService";
import {setActualProfile} from "../../store/slices/Profile.slice";

function App() {
    const dispatch = useDispatch();
    const loadedUser = useSelector(state => state.profile.actualUser);
    let navigate = useNavigate();

    const loadUser = async () => {
        console.log({loadedUser})
        if (loadedUser) return;
        let user = await getSocialPersona().then(response => response.json());
        if (user.error) return;
        /* TODO refactor
                if (data) {
                    navigate("/signUp")
                }
        */
        dispatch(setActualProfile(user))
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
