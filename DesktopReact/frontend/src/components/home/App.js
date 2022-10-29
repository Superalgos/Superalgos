import './App.css';
import Sidebar from "../sidebar/Sidebar";
import {Outlet, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import UsersSidebar from "../userSideBar/UsersSidebar";
import {getProfile, getSocialPersona} from "../../api/profile.httpService";
import {setActualProfile, setSocialPersona} from "../../store/slices/Profile.slice";
import {STATUS_OK} from "../../api/httpConfig";
import {isObjectEmpty} from "../../utils/helper";

function App() {
    const dispatch = useDispatch();
    const loadedUser = useSelector(state => state.profile.actualUser);
    const loadedSocialPersona = useSelector(state => state.profile.socialPersona)
    let navigate = useNavigate();

    const loadUser = async () => {
        if (!(isObjectEmpty(loadedUser) && isObjectEmpty(loadedSocialPersona))) return;
        const socialPersona = await getSocialPersona().then(response => response.json());
        if (socialPersona.error) return;
        dispatch(setSocialPersona(socialPersona))
        dispatch(setActualProfile(socialPersona))
        const {
            data,
            result
        } = await getProfile({socialPersonaId: socialPersona.nodeId}).then(response => response.json())
        if (result === STATUS_OK && (!isObjectEmpty(data))) {
            dispatch(setActualProfile(data))
        } else {
            navigate("/signUp")
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
