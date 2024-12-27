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
import logo from "./assets/Vince.png";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsConditions";

const fields = [
  {
    name: "registrationId",
    label: "Registration ID",
    type: "text",
    disabled: true,
  },
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
  { name: "teamName", label: "Team Name", type: "text", required: true },
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
    options: ["Cash", "GCash"],
    required: true,
  },
];

const GCASH_DETAILS = {
  name: "Vince Warren Pradas",
  number: "0956 563 5353",
};

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
      const range = `${SHEET_NAME}!D2:D`;

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
      const totalPrizePool = prizePoolData.reduce(
        (total, row) => total + parseFloat(row[0] || 0),
        0
      );
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
        <Route path="/home" element={<LandingPage prizePool={prizePool} />} />
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
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  );
};

const Header = () => (
  <header className="w-full py-8 mt-10">
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center space-x-8">
        <img
          src={logo}
          alt="Sponsor 1"
          className="h-12 object-contain opacity-100"
        />
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="w-full py-8 mt-10">
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center space-x-8 text-sm">
        <Link to="/privacypolicy" className="text-blue-700 underline">
          Privacy and Policy
        </Link>
      </div>
      <div className="flex justify-center items-center space-x-8 text-sm">
      <Link to="/termsandconditions" className="text-blue-700 underline">
          Terms and Conditions
        </Link>
      </div>
    </div>
  </footer>
);

const LandingPage = ({ prizePool }) => {
  const [teams, setTeams] = useState([]);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      const SHEET_ID = "1YqD6-pyHZsO2mJc-FJeRFov6zKC1-lP9tyx5O8G93WQ";
      const SHEET_NAME = "Sheet2";
      const range = `${SHEET_NAME}!A2:O`;

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
        ?.filter((row) => row[1])
        .map((row) => ({
          name: row[1],
          status: row[14],
        }));

      setTeams(teamData || []);
      setTeamCount(teamData?.length || 0);
    };

    fetchTeams();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Header />
      <div className="text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black">
          Union MLBB Tournament
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-800 mt-4">
          Cash Prize Pool will be revealed at the end of the registration period
        </h2>
        <h3 className="text-md md:text-base text-gray-800">
          MVP Reward: Buyable Epic skin of your choice
        </h3>
        <h3 className="text-md md:text-lg text-black mt-4 font-bold">
        THERE ARE {teamCount} REGISTERED TEAMS
        </h3>
      </div>
      <Link
        to="/signup"
        className="mt-8 px-4 md:px-6 py-2 md:py-3 bg-black text-white text-sm md:text-base font-semibold border-[1px] rounded-lg hover:border-[1px] hover:border-black hover:bg-slate-50 transition-all hover:text-black w-full md:w-auto max-w-xs text-center"
      >
        REGISTER YOUR TEAM
      </Link>

      <div className="w-full max-w-2xl mt-8 px-4">
        <h4 className="text-lg md:text-xl font-semibold text-black mb-4 text-center">
          PARTICIPATING TEAMS
        </h4>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">
                  No.
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">
                  Team Name
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-800">
                    {team.name}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-800">
                    {team.status}
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No teams registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
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

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const newRow = [
      data.registrationId,
      data.teamName,
      data.email,
      data.fee,
      data.contactNumber,
      "Pending",
      data.date,
      data.teamCaptain,
      data.member2,
      data.member3,
      data.member4,
      data.member5,
      data.sixthMan || "N/A",
      data.paymentMethod,
      "Idle",
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
      const baseMessage =
        `Your team "${formData.teamName}" has been registered successfully!\n\n` +
        `Registration ID: ${formData.registrationId}\n\n`;

      const paymentInstructions =
        formData.paymentMethod === "GCash"
          ? `Please send your payment via GCash:\n` +
            `Name: ${GCASH_DETAILS.name}\n` +
            `Number: ${GCASH_DETAILS.number}\n\n` +
            `Amount: 500\n\n` +
            `After sending payment, please contact the organizer Vince Warren Pradas on Facebook and provide:\n` +
            `1. Your Registration ID\n` +
            `2. Screenshot of GCash payment`
          : "Please contact the organizer Vince Warren Pradas on Facebook to verify your registration and complete the cash payment.\n\n" +
            "Make sure to provide your Registration ID when contacting the organizer.";

      setModalMessage(baseMessage + paymentInstructions);
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
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
        Tournament Registration
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-4 md:p-6 rounded-lg shadow-md"
      >
        {fields.map(
          ({ name, label, type, options, required, disabled, value }) => (
            <label key={name} className="block mb-3 md:mb-4">
              <span className="text-sm md:text-base text-gray-700 font-semibold">
                {label}:
              </span>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg bg-white"
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
                  className={`mt-1 block w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg ${
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
          className="w-full bg-black text-white font-semibold px-4 py-2 rounded-lg border-[1px] hover:bg-slate-50 hover:border-[1px] hover:border-black hover:text-black transition-all text-sm md:text-base"
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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50 overflow-y-auto">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4">
      <h2
        className={`text-xl md:text-2xl font-semibold ${
          isSuccess ? "text-green-600" : "text-red-600"
        }`}
      >
        {isSuccess ? "Registration Successful!" : "Registration Failed"}
      </h2>
      <p className="mt-4 text-sm md:text-base whitespace-pre-line">{message}</p>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2 px-4 bg-black text-white text-sm md:text-base font-semibold rounded-lg hover:bg-gray-800"
      >
        Close
      </button>
    </div>
  </div>
);

export default App;
