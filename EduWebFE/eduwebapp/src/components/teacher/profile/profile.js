
import { useContext, useEffect, useRef, useState } from "react";
import mycontext from "../../../configs/mycontext";
import { authAPI, endpoints } from "../../../configs/APIs";
import { Form, useNavigate } from "react-router-dom";
import { Pencil, Save } from "lucide-react";
import { Button } from "react-bootstrap";

export const Profile = () => {
    const [u] = useContext(mycontext);
    const [user, setUser] = useState(null);
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const avatar = useRef();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [qualification, setQualification] = useState("");

    const [isEditingFirstName, setIsEditingFirstName] = useState(false);
    const [isEditingLastName, setIsEditingLastName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [isEditingQua, setIsEditingQua] = useState(false);
    const [isEditingAvt, setIsEditingAvt] = useState(false);

    const loadUser = async () => {
        let res = await authAPI().get(endpoints['current-user']);
        setUser(res.data);
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setEmail(res.data.email || "");
        setPhoneNumber(res.data.phoneNumber || "");
        setQualification(res.data.qualification || "");
       
        
    };

    useEffect(() => {
        loadUser();
    }, [u.id]);

    const update = async () => {
        let form = new FormData();
        const updatedFields = {};
        if (first_name) updatedFields.first_name = first_name;
        if (last_name) updatedFields.last_name = last_name;
        if (email) updatedFields.email = email;
        if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
        if (qualification) updatedFields.qualification = qualification;
        if (avatar?.current?.files?.[0]) updatedFields.avatar = avatar.current.files[0];

        for (let key in updatedFields) {
            form.append(key, updatedFields[key]);
        }

        try {
            await authAPI().patch(endpoints['update_teacher'](u.id), form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            window.location.reload()
        } catch (ex) {
            console.error(ex);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Account</h2>
            {user === null ? (<>Loading</>) : (<form>
                <div className="flex justify-between items-center">
                    <label className="block text-gray-700">First Name</label>
                    {isEditingFirstName ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingFirstName(false); }}><Save size={20} />Save</Button>
                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingFirstName(true)}><Pencil size={20} />Edit</Button>
                    )}
                </div>
                <input
                    type="text"
                    name="firstName"
                    className="w-full mt-2 mb-4 p-2 border rounded"
                    required
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditingFirstName}
                />

                <div className="flex justify-between items-center">
                    <label className="block text-gray-700">Last Name</label>
                    {isEditingLastName ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingLastName(false); }}><Save size={20} />Save</Button>
                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingLastName(true)}><Pencil size={20} />Edit </Button>
                    )}
                </div>
                {isEditingLastName ? (
                    <input
                        type="text"
                        name="lastName"
                        className="w-full mt-2 p-2 border rounded"
                        required
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditingLastName}
                    />
                ) : (
                    <input
                        type="text"
                        value={last_name}
                        className="w-full mt-2 p-2 border rounded"
                        readOnly
                    />
                )}

                <div className="flex justify-between items-center">
                    <label className="block text-gray-700">Email</label>
                    {isEditingEmail ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingEmail(false); }}><Save size={20} />Save</Button>
                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingEmail(true)}><Pencil size={20} />Edit</Button>
                    )}
                </div>
                <input
                    type="email"
                    name="email"
                    className="w-full mt-2 mb-4 p-2 border rounded"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingEmail}
                />

                <div className="flex justify-between items-center">
                    <label className="block text-gray-700">Qualification</label>
                    {isEditingQua ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingQua(false); }}><Save size={20} />Save</Button>

                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingQua(true)}><Pencil size={20} />Edit</Button>
                    )}
                </div>
                <input
                    type="text"
                    className="w-full mb-4 mt-2 p-2 border rounded"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    disabled={!isEditingQua}
                />

                <div className="flex justify-between items-center">
                    <label className="block text-gray-700">Phone Number</label>
                    {isEditingPhone ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingPhone(false); }}><Save size={20} />Save</Button>
                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingPhone(true)}><Pencil size={20} />Edit</Button>
                    )}
                </div>
                <input
                    type="text"
                    name="phoneNumber"
                    className="w-full mb-4 mt-2 p-2 border rounded"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditingPhone}
                />

                <div className="mb-4 flex justify-between items-center">
                    <label className="block text-gray-700">Avatar</label>
                    {isEditingAvt ? (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => { update(); setIsEditingAvt(false); }}><Save size={20} />Save</Button>
                    ) : (
                        <Button
                            size="sm"
                            className="p-0 d-flex align-items-center text-dark bg-transparent border-0"
                            onClick={() => setIsEditingAvt(true)}><Pencil size={20} />Edit</Button>
                    )}
                </div>
                {isEditingAvt ? (
                    <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        className="w-full mt-2"
                        ref={avatar}
                    />
                ) : (
                    <img
                        src={user.avatar}
                        alt="Avatar"
                        style={{ width: '100px', height: 'auto', marginBottom: '10px' }}
                    />
                )}
            </form>)}

        </div>
    );
};