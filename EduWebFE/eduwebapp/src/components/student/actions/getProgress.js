import { useState } from "react"
import APIs, { endpoints } from "../../../configs/APIs"

export const GetProgress=()=>{
    const [publishedChapter, setPublishChapter] = useState()
    const [completedChapter, setCompleteChapter] = useState()
    const publishChapterIds=async()=>{
        let res = await APIs.get(endpoints['get_chapter_of_course'])
        setPublishChapter(res.data)
    }
    const validCompleteChapter=async()=>{
        let res = await APIs.get(endpoints['get_chapter_of_course'])
        setCompleteChapter(res.data)
    }
    const progressPercent = publishedChapter.length > 0 
    ? (completedChapter.length / publishedChapter.length) * 100 
    : 0;


    
    return(
        <h1>HHHHHHh</h1>
    )
}