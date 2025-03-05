// import { useState } from "react";
// import { useLocation, useNavigate} from 'react-router-dom';



// export const AddCourseTitle = () => {
//   const [title, setTitle] = useState("");
//   const navigate = useNavigate();


//   const handleCancel=()=>{
//     navigate('/teawall')
//   }
//   const handleContinue=()=>{
//     navigate('/teawall/edit_course')
//   }

//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-50">
//       <div className="p-8 bg-gray-50 rounded-md max-w-md w-full">
//         <h1 className="text-3xl font-semibold mb-2">Name your course</h1>
//         <p className="text-gray-500 mb-6">
//           What would you like to name your course? Don't worry, you can always change this later.
//         </p>
//         <div className="mb-6">
//           <label className="block text-gray-700 text-sm font-medium mb-2">
//             Course title
//           </label>
//           <input
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             type="text"
//             placeholder="e.g. 'Advanced Web Development'"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
//           />
//         </div>
//         <p className="text-gray-500 mb-6">
//           What will you teach in this course?
//         </p>
//         <div className="flex items-center justify-between">
//           <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800 font-medium">
//             Cancel
//           </button>
//           <button onClick={handleContinue}
//             className={`px-4 py-2 text-white rounded-md ${
//               title ? 'bg-gray-800 cursor' : 'bg-gray-200 cursor-not-allowed'
//             }`}
//             disabled={!title}
//           >
//             Continue
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
