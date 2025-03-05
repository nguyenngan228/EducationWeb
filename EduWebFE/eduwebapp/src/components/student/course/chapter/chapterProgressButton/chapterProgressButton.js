import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "react-bootstrap"
import './chapterProgressButton.css'

export const ChapterProgressButton = ({ onClick, isCompleted }) => {
    const Icon = isCompleted ? XCircle : CheckCircle;
    const btn = isCompleted ?"uncompleted": "completed"  ; 

    return (
        <Button
            size="sm"
            className={`d-flex align-items-center ${btn}`}
            onClick={onClick}
            type="submit"
        >
            <Icon className="h-4 me-1 w-4 ml-2" />
            {isCompleted ? "Not completed" : "Mark as complete"}
        </Button>
    );
}