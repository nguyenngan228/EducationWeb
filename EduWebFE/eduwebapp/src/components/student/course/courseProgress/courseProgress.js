
import ProgressBar from 'react-bootstrap/ProgressBar';
export const CourseProgress = ({ value }) => {

    return (
        <div>
            <ProgressBar variant='success' now={value} style={{height:'5px'}}/>
            <p style={{fontWeight: 'bold', color: '#28a745'}} className="progress-text mt-1 text-sm">{`${Math.floor(value)}% Complete`}</p>
        </div>
    );
};