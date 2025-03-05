import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI, endpoints } from "../../../../configs/APIs";

const PaymentSuccess = () => {
    const location = useLocation();
    const nav = useNavigate();
    
    useEffect(() => {
        const fetchPaymentStatus = async () => {
            const params = new URLSearchParams(location.search);
            const session_id = params.get('session_id');

            try {
                let res = await authAPI().get(`${endpoints['payment_success']}?session_id=${session_id}`);
                if (res.data.status === 'success') {
                    const courseIds = res.data.course_ids;
                    if (courseIds.length === 1) {
                        nav(`/stuwall/course/${courseIds[0]}`);
                    } else {
                    
                        nav('/stuwall/my-course');
                    }
                } else {
                    alert("Something went wrong");
                }
            } catch (ex) {
                console.error(ex);
                alert("Something went wrong");
            }
        };

        fetchPaymentStatus();
    }, [location]);

    return (
        <div>
            <h1>Payment success!</h1>
            <p>You will be directed to course </p>
        </div>
    );
};

export default PaymentSuccess;
