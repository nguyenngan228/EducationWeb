import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import APIs, { authAPI, endpoints } from '../../../configs/APIs';
import './course.css'


const AddCourse = () => {
  const navigate = useNavigate();
  const [price, setPrice] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState()
  const [listCate, setListCate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const thumbnail = useRef();
  



  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSelectChange = (event) => {
    setSelectedCategory(event.target.value);
  };




  const addCourse = async (e) => {
    setIsLoading(true)
    e.preventDefault();
    let form = new FormData();
    form.append('price', price);
    form.append('title', title)
    form.append('description', description)
    form.append('category', selectedCategory)
    form.append('publish', 'False')
    if (thumbnail?.current?.files?.[0]) {
      form.append('thumbnail', thumbnail.current.files[0]);
    } else {
      console.info('No file image')
    }
    try {
      let res = await authAPI().post(endpoints['create_course'], form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/teawall/course/${res.data.id}/add_chapter`, { state: { id: res.data.id } })

    } catch (ex) {
      console.error(ex)
    }finally {
      setIsLoading(false);  
    }
  }

  const getListCate = async () => {
    let res = await APIs.get(endpoints['listCate']);
    setListCate(res.data)
  }
  useEffect(() => {
    getListCate();
  }, [])
  const field = [price, title, description, selectedCategory, thumbnail]
  const total = field.length;
  const completed = field.filter(Boolean).length;
  const completionText = `(${completed}/ ${total})`;



  return (
    <div className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-y-2'>
          <h1 className='text-2xl font-medium'>Create course</h1>
          <span className='text-sm text-slate-700'>Complete all fields {completionText}</span>
        </div>
      </div>
      <div className='container-fluid mt-16'>
        <Form onSubmit={addCourse}>
          <Row className="no-gutters">
            <Col md={6}>
              <Form.Group controlId="formCourseTitle" className="mb-3">
                <Form.Label className="form-label">Course title</Form.Label>
                <Form.Control
                  value={title} onChange={t => setTitle(t.target.value)}
                  type="text"
                  placeholder="e.g. Advanced Development"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formCourseDescription" className="mb-3">
                <Form.Label className="form-label">Description</Form.Label>
                <Form.Control
                  value={description} onChange={t => setDescription(t.target.value)}
                  as="textarea"
                  style={{ height: '100px' }}
                  placeholder="e.g. This course is about..."
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formCourseThumbnail" className="mb-3">
                <Form.Label className="form-label">Set thumbnail</Form.Label>
                <Form.Control
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  ref={thumbnail}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formCoursePrice" className="mb-3">
                <Form.Label className="form-label">Price</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. $0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="custom-select-wrapper">
                <label style={{ fontWeight: 'bold', margin: '10px' }} htmlFor="categories">Category:</label>
                <select
                  id="categories"
                  className="custom-select"
                  value={selectedCategory}
                  onChange={handleSelectChange}
                >
                  <option value="">Choose an option</option>
                  {listCate === null ? (
                    <Spinner animation="border" />
                  ) : (
                    listCate.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </Col>
          </Row>
          {completed === total && (
            <Button
              onClick={addCourse}
              style={{ backgroundColor: '#0000FF' }}
              type="submit"
              className="w-30 mt-3"
              disabled={isLoading}
            >
             {isLoading?"Loading":"Create"} 
            </Button>
          )}
        </Form>
      </div>
    </div>
  );
}

export default AddCourse;
