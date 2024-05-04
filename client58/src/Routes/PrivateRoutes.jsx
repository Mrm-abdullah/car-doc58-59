import { useContext } from "react";
import { AuthContext } from "../Provider/AuthProviders";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({children}) => {
    const {user, loading} = useContext(AuthContext)

    if (loading) {
        return <span className="loading loading-bars loading-lg"></span>
    }
    if (user?.email) {
        return children
    }
    return <Navigate to='/login' replace></Navigate>
};

export default PrivateRoutes;