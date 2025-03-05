import { useEffect, useState } from "react"
import { Form, useLocation, useNavigate } from "react-router-dom"
import APIs, { authAPI, endpoints } from "../../configs/APIs"
import { Button, Container, Spinner } from "react-bootstrap"

export const InterestCate = () => {

    const [listCate, setListCate] = useState(null)
    const location = useLocation()
    const { userId } = location.state
    const navigate = useNavigate()
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleSelectChange = (event) => {
        setSelectedCategory(event.target.value);
    };
    const getListCate = async () => {
        let res = await APIs.get(endpoints['listCate']);
        setListCate(res.data)
    }
    useEffect(() => {
        getListCate();
    }, [])

    const addInterest = async () => {
        try {
            let res = await APIs.post(endpoints['add_student'](userId), {
                'interesting_cate': selectedCategory
            })
            navigate('/login')
        } catch (ex) { console.error(ex) }
    }
    return (
        <Container
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh' 
            }}
        >
            <div style={{ textAlign: 'center' }}> 
                <label style={{ fontWeight: 'bold', margin: '10px' }} htmlFor="categories">
                    Choose category you interest:
                </label>
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
                <Button onClick={addInterest} style={{ backgroundColor: "black",color:'white' }} type="submit" className="w-100 mt-3">
                    Continue
                </Button>
            </div>
        </Container>

    )
}