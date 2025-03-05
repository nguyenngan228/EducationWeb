import cookie from 'react-cookies'



const MyUserReducer=(currentState,action)=>{
    switch(action.type){
        case "login":
            return action.payload;
        case "logout":
            cookie.remove("token")
            return null;
    }
    return currentState;
}
export default MyUserReducer