import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { gapi } from "gapi-script";

// Define form fields configuration in the requested order
const fields = [
  {
    name: "registrationId",
    label: "Registration ID",
    type: "text",
    disabled: true,
  },
  { name: "teamName", label: "Team Name", type: "text", required: true },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    disabled: true,
  },
  {
    name: "fee",
    label: "Registration Fee (₱)",
    type: "number",
    required: true,
    disabled: true,
    value: 500,
  },
  {
    name: "contactNumber",
    label: "Contact Number",
    type: "tel",
    required: true,
  },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "teamCaptain", label: "Team Captain", type: "text", required: true },
  { name: "member2", label: "Member 2", type: "text", required: true },
  { name: "member3", label: "Member 3", type: "text", required: true },
  { name: "member4", label: "Member 4", type: "text", required: true },
  { name: "member5", label: "Member 5", type: "text", required: true },
  {
    name: "sixthMan",
    label: "6th Man (Optional)",
    type: "text",
    required: false,
  },
  {
    name: "paymentMethod",
    label: "Payment Method",
    type: "select",
    options: ["Cash"],
    required: true,
  },
];

const App = () => {
  const [prizePool, setPrizePool] = useState(() => {
    const savedPrizePool = localStorage.getItem("prizePool");
    return savedPrizePool ? parseFloat(savedPrizePool) : 0;
  });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const start = () => {
      gapi.load("client:auth2", initClient);
    };

    const initClient = () => {
      gapi.client
        .init({
          apiKey: "AIzaSyCUILdvDnZZc9tn0LuPzf89qvkN26zvv0s",
          clientId:
            "1018803542684-8lqm6gh9t9do468m5olbk74cg6a9vb8n.apps.googleusercontent.com",
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: "https://www.googleapis.com/auth/spreadsheets",
        })
        .then(() => {
          const GoogleAuth = gapi.auth2.getAuthInstance();
          if (GoogleAuth.isSignedIn.get()) {
            const user = GoogleAuth.currentUser.get();
            setUserEmail(user.getBasicProfile().getEmail());
          } else {
            GoogleAuth.signIn().then(() => {
              const user = GoogleAuth.currentUser.get();
              setUserEmail(user.getBasicProfile().getEmail());
            });
          }
        });
    };

    const fetchPrizePool = async () => {
      const SHEET_ID = "1YqD6-pyHZsO2mJc-FJeRFov6zKC1-lP9tyx5O8G93WQ";
      const SHEET_NAME = "Sheet2";
      const range = `${SHEET_NAME}!D2:D`; // Fetching the prize pool column

      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`,
        {
          headers: {
            Authorization: `Bearer ${
              gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
                .access_token
            }`,
          },
        }
      );

      const prizePoolData = response.data.values;
      const totalPrizePool = prizePoolData.reduce((total, row) => total + parseFloat(row[0] || 0), 0);
      setPrizePool(totalPrizePool);
      localStorage.setItem("prizePool", totalPrizePool);
    };

    start();
    fetchPrizePool();
  }, []);

  useEffect(() => {
    localStorage.setItem("prizePool", prizePool);
  }, [prizePool]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage prizePool={prizePool} />} />
        <Route
          path="/signup"
          element={
            <RegistrationForm
              prizePool={prizePool}
              setPrizePool={setPrizePool}
              userEmail={userEmail}
            />
          }
        />
      </Routes>
    </Router>
  );
};

const LandingPage = ({ prizePool }) => {
  const [teams, setTeams] = useState([]);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      const SHEET_ID = "1YqD6-pyHZsO2mJc-FJeRFov6zKC1-lP9tyx5O8G93WQ";
      const SHEET_NAME = "Sheet2";
      const range = `${SHEET_NAME}!A2:O`; // Fetching all relevant columns

      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`,
        {
          headers: {
            Authorization: `Bearer ${
              gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
                .access_token
            }`,
          },
        }
      );

      const teamData = response.data.values
        ?.filter(row => row[1]) // Filter out empty team names
        .map((row) => ({
          name: row[1], // Team name
          status: row[14] // Team status
        }));

      setTeams(teamData || []);
      setTeamCount(teamData?.length || 0);
    };

    fetchTeams();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800">Tournament</h1>
      <h2 className="text-2xl text-gray-600 mt-4">
        Current Prize Pool: PHP {prizePool.toFixed(2)-500} 
      </h2>
      <span className="text-gray-500">MVP Reward: Buyable Epic skin of choice</span>
      <h3 className="text-xl text-gray-600 mt-2">
        Total Teams Registered: {teamCount}
      </h3>
      <Link
        to="/signup"
        className="mt-8 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-blue-600"
      >
        Sign Up
      </Link>
      
      <div className="w-full max-w-2xl mt-8">
        <h4 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Registered Teams
        </h4>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {team.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                    {team.status}
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No teams registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RegistrationForm = ({ prizePool, setPrizePool, userEmail }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registrationId: Date.now().toString().slice(-6),
    teamName: "",
    email: userEmail || "",
    fee: 500,
    contactNumber: "",
    date: new Date().toISOString().split("T")[0],
    teamCaptain: "",
    member2: "",
    member3: "",
    member4: "",
    member5: "",
    sixthMan: "",
    paymentMethod: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: userEmail,
      registrationId: Date.now().toString().slice(-6),
    }));
  }, [userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveToGoogleSheets = async (data) => {
    const SHEET_ID = "1YqD6-pyHZsO2mJc-FJeRFov6zKC1-lP9tyx5O8G93WQ";
    const SHEET_NAME = "Sheet2";
    const range = `${SHEET_NAME}!A:O`;

    const GoogleAuth = gapi.auth2.getAuthInstance();
    const user = GoogleAuth.currentUser.get();
    const token = user.getAuthResponse().access_token;

    // Construct the URL for the Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;

    // Prepare data in the specified order with default values
    const newRow = [
      data.registrationId,
      data.teamName,
      data.email,
      data.fee,
      data.contactNumber,
      "Pending", // Default payment status
      data.date,
      data.teamCaptain,
      data.member2,
      data.member3,
      data.member4,
      data.member5,
      data.sixthMan || "N/A",
      data.paymentMethod,
      "Idle", // Default team status
    ];

    await axios.post(
      url,
      { range, majorDimension: "ROWS", values: [newRow] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await saveToGoogleSheets(formData);
      setPrizePool(prizePool + 500);

      setIsSuccess(true);
      setModalMessage(
        `Your team "${formData.teamName}" has been registered successfully!\n\n` +
          `Registration ID: ${formData.registrationId}\n\n` +
          "Please contact the organizer Vince Warren Pradas on Facebook to verify your registration and complete the cash payment.\n\n" +
          "Make sure to provide your Registration ID when contacting the organizer."
      );
      setShowModal(true);
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      setIsSuccess(false);
      setModalMessage("Failed to register. Please try again.");
      setShowModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Tournament Registration
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
      >
        {fields.map(
          ({ name, label, type, options, required, disabled, value }) => (
            <label key={name} className="block mb-4">
              <span className="text-gray-700 font-semibold">{label}:</span>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  required={required}
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={value || formData[name] || ""}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg ${
                    disabled ? "bg-gray-100" : "bg-white"
                  }`}
                  required={required}
                  disabled={disabled}
                />
              )}
            </label>
          )
        )}
        <button
          type="submit"
          className="w-full bg-black text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Register
        </button>
      </form>
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => {
            setShowModal(false);
            if (isSuccess) {
              navigate("/");
            }
          }}
          isSuccess={isSuccess}
        />
      )}
    </div>
  );
};

const Modal = ({ message, onClose, isSuccess }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2
        className={`text-2xl font-semibold ${
          isSuccess ? "text-green-600" : "text-red-600"
        }`}
      >
        {isSuccess ? "Registration Successful!" : "Registration Failed"}
      </h2>
      <p className="mt-4 whitespace-pre-line">{message}</p>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2 px-4 bg-black text-white font-semibold rounded-lg hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
);

export default App;