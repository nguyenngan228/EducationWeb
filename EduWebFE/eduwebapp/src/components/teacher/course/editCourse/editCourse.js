import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Col, Row, Spinner, ButtonGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import APIs, { authAPI, endpoints } from '../../../../configs/APIs';
import { Pencil, PlusCircle, Trash } from 'lucide-react';
import confetti from 'canvas-confetti';


const EditCourse = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState();
  const [price, setPrice] = useState();
  const [title, setTitle] = useState();
  const [publish, setPublish] = useState();
  const [description, setDescription] = useState();
  const [listCate, setListCate] = useState(null);
  const [image, setImage] = useState();
  const thumbnail = useRef();
  const { id } = useParams();
  const [category, setCategory] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingThumbnail, setIsEditingThumbnail] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [chapter, setChapter] = useState(null)

  const showConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 }
    });
  };


  const getCourse = async () => {
    try {
      let res = await authAPI().get(endpoints['get_detail_course'](id));
      setCourse(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setPrice(res.data.price);
      setCategory(res.data.category.title);
      setImage(res.data.thumbnail);
      setPublish(res.data.publish)
    } catch (ex) {
      console.error(ex);
    }

  }

  useEffect(() => {
    getCourse();
  }, [id]);

  const navToEditChapter = (chapterId) => {
    navigate(`/teawall/course/${id}/edit_chapter/${chapterId}`)
  }


  const updateCourse = async (newPublishStatus) => {
    let form = new FormData();
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (price) updatedFields.price = price;
    if (description) updatedFields.description = description;
    if (category) updatedFields.category = category;
    if (newPublishStatus) 
      updatedFields.publish = newPublishStatus;
    else
      updatedFields.publish = publish;
    if (thumbnail?.current?.files?.[0]) updatedFields.thumbnail = thumbnail.current.files[0];


    for (let key in updatedFields) {
      form.append(key, updatedFields[key]);

    }
    try {

      let res = await authAPI().patch(endpoints['update_course'](course.id), form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/teawall/course/${course.id}/edit_course`);
    } catch (ex) {
      console.error(ex);
    }
  }

  const getListCate = async () => {
    let res = await APIs.get(endpoints['listCate']);
    setListCate(res.data);
  }

  useEffect(() => {
    getListCate();
  }, []);

  const getChapter = async () => {
    let res = await authAPI().get(endpoints['get_chapter_of_course'](id));
    setChapter(res.data);
  }
  useEffect(() => {
    getChapter();
  }, [id]);
  const changePublish = async () => {
    const newPublishStatus = !publish;

    await updateCourse(newPublishStatus);
    setPublish(newPublishStatus);
    if (!publish && newPublishStatus) {
      showConfetti();
    }

  };
  const handleAddChater = () => {
    navigate(`/teawall/course/${course.id}/add_chapter`)
  }


  return (
    <div className='p-6'>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Edit course</h1>
        <div className="flex gap-x-2 ml-auto">
          <Button onClick={changePublish} className={`border-0 ${publish ? 'bg-black text-white' : 'bg-transparent text-dark'}`}>
            {publish ? "Publish" : "Unpublish"}
          </Button>
          <Button className="text-dark bg-black text-white border-0">
            <Trash />
          </Button>
        </div>
      </div>


      <div className='container-fluid mt-16'>
        <Form>
          <Row className="no-gutters">
            <Col md={6}>
              <div className="course-title-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Course title</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingTitle(!isEditingTitle)}
                  >
                    <Pencil className="me-1" /> {isEditingTitle ? 'Cancel' : 'Edit Title'}
                  </Button>
                </div>

                {isEditingTitle ? (
                  <Form.Group controlId="formCourseTitle" className="mb-3">
                    <Form.Control
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      type="text"
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateCourse();
                        setIsEditingTitle(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                ) : (
                  <p style={{ fontSize: '18px', marginBottom: '0' }}>{title}</p>
                )}
              </div>

              {/* Description */}
              <div className="course-title-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Description</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                  >
                    <Pencil className="me-1" /> {isEditingDescription ? 'Cancel' : 'Edit Description'}
                  </Button>
                </div>

                {isEditingTitle ? (
                  <Form.Group controlId="formCourseTitle" className="mb-3">
                    <Form.Control
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      type="text"
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateCourse();
                        setIsEditingDescription(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                ) : (
                  <p style={{ fontSize: '18px', marginBottom: '0' }}>{description}</p>
                )}
              </div>


              <div className="course-thumbnail-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Set thumbnail</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingThumbnail(!isEditingThumbnail)}
                  >
                    <Pencil className="me-1" /> {isEditingThumbnail ? 'Cancel' : 'Edit Thumbnail'}
                  </Button>
                </div>

                {!isEditingThumbnail && image && (
                  <div>
                    <img
                      src={image}
                      alt="Current thumbnail"
                      style={{ width: '100px', height: 'auto', marginBottom: '10px' }}
                    />
                  </div>
                )}

                {isEditingThumbnail && (
                  <Form.Group controlId="formCourseThumbnail" className="mb-3">
                    <Form.Control
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      ref={thumbnail}
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateCourse();
                        setIsEditingThumbnail(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="course-title-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Price</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingPrice(!isEditingPrice)}
                  >
                    <Pencil className="me-1" /> {isEditingPrice ? 'Cancel' : 'Edit Price'}
                  </Button>
                </div>

                {isEditingTitle ? (
                  <Form.Group controlId="formCourseTitle" className="mb-3">
                    <Form.Control
                      value={title}
                      onChange={e => setPrice(e.target.value)}
                      type="text"
                      required
                    />
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateCourse();
                        setIsEditingPrice(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </Form.Group>
                ) : (
                  <p style={{ fontSize: '18px', marginBottom: '0' }}>{price}</p>
                )}
              </div>
              {/* ========== */}
              <div className="course-category-editor" style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', margin: '10px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="form-label mb-0" style={{ fontWeight: 'bold' }}>Category</Form.Label>
                  <Button
                    size="sm"
                    className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                    onClick={() => setIsEditingCategory(!isEditingCategory)}
                  >
                    <Pencil className="me-1" /> {isEditingCategory ? 'Cancel' : 'Edit Category'}
                  </Button>
                </div>

                {isEditingCategory ? (
                  <>
                    <Form.Select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="mt-2"
                    >
                      <option value="">{category}</option>
                      {listCate && listCate.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      size="sm"
                      className="mt-2 text-white"
                      style={{
                        backgroundColor: '#000',
                        border: 'none',
                      }}
                      onClick={() => {
                        updateCourse();
                        setIsEditingCategory(false);
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#333'}
                      onMouseOut={e => e.target.style.backgroundColor = '#000'}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={category}
                    disabled
                    className="mt-2"
                  />
                )}
              </div>
              <div className="w-full p-4 rounded shadow" style={{ backgroundColor: '#f8fafc' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="text-lg font-bold">Course chapters</h3>
                  <button onClick={handleAddChater} style={{ fontWeight: 'bold' }} className="flex items-center px-4 py-2 border-none cursor-pointer text-sm">
                    <PlusCircle size={20} className="mr-2" />
                    Add a chapter
                  </button>
                </div>
                {chapter === null ? (
                  <Spinner animation="border" />
                ) : (
                  <div>
                    {chapter.map((c, index) => (
                      <div key={index} className="flex items-center justify-between p-1 mb-2 bg-blue-100 rounded">
                        <div className="flex items-center">
                          <div className="mr-4 cursor-pointer">::</div>
                          <div>{c.title}</div>
                        </div>
                        <div className="flex items-center">
                          {c.is_free && (
                            <div className="px-2 py-1 text-xs text-white bg-black rounded-full">Free</div>
                          )}
                          <div className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">Published</div>
                          <button onClick={() => navToEditChapter(c.id)} className="ml-2 flex items-center text-blue-500 hover:text-blue-700 bg-transparent border-none cursor-pointer">
                            <Pencil className="me-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default EditCourse;
