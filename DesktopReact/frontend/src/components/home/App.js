import './App.css';
import Sidebar from "../sidebar/Sidebar";
import {Outlet, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import UsersSidebar from "../userSideBar/UsersSidebar";
import {getProfile, getSocialPersona} from "../../api/profile.httpService";
import {setActualProfile, setSocialPersona} from "../../store/slices/Profile.slice";
import {STATUS_OK} from "../../api/httpConfig";
import {isEmpty} from "../../utils/helper";

function App() {
    const dispatch = useDispatch();
    const loadedUser = useSelector(state => state.profile.actualUser);
    const loadedSocialPersona = useSelector(state => state.profile.socialPersona)
    let navigate = useNavigate();

    const loadUser = async () => {
        let loadUser = isEmpty(loadedUser) && isEmpty(loadedSocialPersona);
        if (!loadUser) return;
        let socialPersona = await getSocialPersona().then(response => response.json());
        if (socialPersona.error) return;
        dispatch(setSocialPersona(socialPersona))
        /* TODO refactor
                if (data) {
                    navigate("/signUp")
                }
        */

        let {profileData, result} = await getProfile().then(response => response.json())
        if (result === STATUS_OK) {
            dispatch(setActualProfile(profileData))
        }

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
