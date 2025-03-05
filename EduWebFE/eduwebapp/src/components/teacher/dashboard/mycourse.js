import React, { useContext, useEffect, useState } from 'react';
import { Table, Button, InputGroup, FormControl, Row, Col, Spinner, Pagination, Dropdown } from 'react-bootstrap';
import { BsThreeDotsVertical, BsPlusCircle, BsArrowDownUp } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { authAPI, endpoints } from '../../../configs/APIs';
import mycontext from '../../../configs/mycontext';


const MyCourse = () => {
  const navigate = useNavigate()
  const [listCourse, setListCourse] = useState(null)
  const [q, setQ] = useState("")
  const [user, dispatch] = useContext(mycontext);
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1);

  const navToAdd = () => {
    navigate('/teawall/course/add')
  }
  const navToEdit = (id) => {
    navigate(`/teawall/course/${id}/edit_course/`);

  }
  const navToMember = (id) => {
    navigate(`/teawall/course/${id}/member_course/`);

  }
  const getListCourse = async () => {
    try {
      const url = `${q}&page=${page}`
      let res = await authAPI().get(endpoints['my_list_course'](url));
      setListCourse(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 5));
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    getListCourse();
  }, [user.id, q, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="m-5">
      <Row className="mb-3">
        <Col md={9}>
          <InputGroup>
            <FormControl
              placeholder="Filter courses..."
              aria-label="Filter courses"
              value={q}
              onChange={t => setQ(t.target.value)}
            />
          </InputGroup >
        </Col>
        <Col md={3} className="d-flex justify-content-end">
          <Button onClick={navToAdd} variant="primary">
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <BsPlusCircle style={{ marginRight: '5px', fontWeight: 'bold' }} /> New Course
            </div>
          </Button>
        </Col>
      </Row>
      <Table  bordered hover responsive>
        <thead>
          <tr>
            <th>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Title <BsArrowDownUp style={{ marginLeft: '5px' }} />
              </div>
            </th>
            <th>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Price <BsArrowDownUp style={{ marginLeft: '5px' }} />
              </div>
            </th>
            <th>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Status <BsArrowDownUp style={{ marginLeft: '5px' }} />
              </div>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listCourse === null ? (
            <Spinner animation="border" />
          ) : (
            <>
              {listCourse.map((course, index) => (
                <tr key={index}>
                  <td>{course.title}</td>
                  <td>${course.price.toFixed(2)}</td>
                  <td>
                    <Button size="sm" className="rounded-pill" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', margin: '0 0.2rem' }}>
                      {course.publish ? "Published" : "Unpublished"}
                    </Button>

                  </td>
                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle as={Button} variant="light" size="sm">
                        <BsThreeDotsVertical />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navToEdit(course.id)}>Edit Course</Dropdown.Item>
                        <Dropdown.Item onClick={() => navToMember(course.id)}>List member of course</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </Table>
      <Pagination size="sm" className="justify-content-center mt-3">
        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
        <Pagination.Item>{page}</Pagination.Item>
        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
      </Pagination>
    </div>
  );
}

export default MyCourse;
