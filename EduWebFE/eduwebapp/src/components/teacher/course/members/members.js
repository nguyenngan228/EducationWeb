import { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap"
import { useParams } from "react-router-dom";
import { authAPI, endpoints } from "../../../../configs/APIs";

export const MembersOfCourse = () => {
    const { id } = useParams();
    const [members, setMembers] = useState(null)
    const getMember = async () => {
        try {
            let res = await authAPI().get(endpoints['get_member'](id))
            setMembers(res.data.students)
        } catch (ex) {
            console.error(ex)
        }
    }
    useEffect(() => {
        getMember()
    }, id)
    return (
        <Container className="d-flex justify-content-center">
            <Table bordered hover style={{ width: '80%', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                Name
                            </div>
                        </th>
                        <th>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                Email
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {members === null ? (
                        <Spinner animation="border" />
                    ) : (
                        <>
                            {members.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.user.first_name} {course.user.last_name}</td>
                                    <td>{course.user.email}</td>

                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </Table>
        </Container>
    )
}