import { useEffect, useRef, useState } from "react";
import { CiAt } from "react-icons/ci";
import useSuggestedUsernames from "./useSuggestedUsernames";
import { TiDeleteOutline } from "react-icons/ti";

const App = () => {
  const serverUri = import.meta.env.VITE_SERVER_URI;
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [feelingLucky, setFeelingLucky] = useState(false);
  const [editId, setEditId] = useState(null);
  const rulesRef = useRef(null);
  function convertToValidUsername(input) {
    let username = input.trim();

    username = username.replace(/[^a-zA-Z0-9._-]/g, "_");

    if (username.length < 3) {
      username = username.padEnd(3, "_");
    } else if (username.length > 15) {
      username = username.substring(0, 15);
    }

    username = username.replace(/^[._-]+/, "a").replace(/[._-]+$/, "z");

    return username;
  }
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
  function suggestUsernames(input) {
    if (input) {
      const suggestions = [
        `${Math.floor(Math.random() * 100)}${input}`,
        `${input}${Math.floor(Math.random() * 100)}`,
        `${input}_${Math.floor(Math.random() * 100)}`,
        `${input}${new Date().getFullYear()}`,
        `${input}${Math.floor(Math.random() * 10)}`,
      ];
      return [...new Set(shuffleArray(suggestions))];
    }
    return [];
  }

  const suggestedUsernamesFromAi = useSuggestedUsernames();
  const suggestedUsernames = suggestUsernames(username);

  const handleSaveUsername = () => {
    if (username) {
      fetch(`${serverUri}/api/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })
        .then((res) => res.json())
        .then(() => {
          setUsername("");
          setUsernames([{ username }, ...usernames]);
        });
    }
  };

  useEffect(() => {
    const fetchUsernames = () => {
      fetch(`${serverUri}/api/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUsernames([...res.usernames]);
        });
    };
    fetchUsernames();
  }, [serverUri]);

  const handleDeleteUsername = (id) => {
    if (id) {
      fetch(`${serverUri}/api/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(() => {
          const changedUsernames = usernames.filter((un) => un._id !== id);
          setUsernames(changedUsernames);
        });
    }
  };

  const handleUpdateUsername = () => {
    const id = editId;
    const updatedUsername = username;
    if (id) {
      fetch(`${serverUri}/api/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: updatedUsername }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          const changedUsernames = usernames.map((un) => {
            if (un._id === id) un.username = updatedUsername;
            return un;
          });
          console.log(changedUsernames);
          setEditId(null);
          setUsername("");
          setUsernames(changedUsernames);
        });
    }
  };
  return (
    <>
      <div className="flex flex-col w-full md:w-2/3 mx-auto p-2">
        <h1 className="text-2xl my-2">
          Change your <span className="text-fuchsia-600">username</span> often
          for your online presence? Choose{" "}
          <span className="text-fuchsia-600">one</span> for once and all
        </h1>
        <input
          type="text"
          name="username"
          id="username"
          className="ring-2 md:ring-4 ring-fuchsia-200 ring-offset-fuchsia-400 p-2 md:p-4 my-2 text-4xl md:text-6xl text-fuchsia-600 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
        />
        <div className="flex flex-wrap">
          {feelingLucky
            ? suggestedUsernamesFromAi.map((un) => (
                <button
                  key={un}
                  className="p-2 m-1 text-lg rounded-full border-2 hover:border-fuchsia-400"
                  onClick={() => setUsername(un)}
                >
                  {un}
                </button>
              ))
            : suggestedUsernames.map((un) => (
                <button
                  key={un}
                  className="p-2 m-1 text-lg rounded-full border-2 hover:border-fuchsia-400"
                  onClick={() => setUsername(un)}
                >
                  {un}
                </button>
              ))}
        </div>
        <div className="flex flex-row justify-end">
          {feelingLucky && (
            <button
              className="m-2 hover:underline decoration-fuchsia-400"
              onClick={() => localStorage.removeItem("cachedUsernames")}
            >
              Stale AI suggestions?
            </button>
          )}
          <button
            className="m-2 hover:underline decoration-fuchsia-400"
            onClick={() => setFeelingLucky(!feelingLucky)}
          >
            {!feelingLucky
              ? "Clueless? AI suggestions..."
              : "No AI suggestions?"}
          </button>
        </div>
        <p className="text-2xl">Looks like...</p>
        <p className="text-4xl my-2 truncate leading-normal" title={username}>
          {username ? (
            <>
              <CiAt className="text-fuchsia-200 inline-block" size={40} />
              {convertToValidUsername(username)}
            </>
          ) : (
            "🤷"
          )}
        </p>
        <button
          onClick={editId ? handleUpdateUsername : handleSaveUsername}
          className="bg-fuchsia-100 p-2 rounded text-2xl hover:bg-fuchsia-200 text-fuchsia-600 w-2/3 md:w-1/3"
        >
          Save it?
        </button>
        <p className="text-2xl my-2 text-right">Saved usernames (Global)</p>
        <div className="flex flex-wrap">
          {usernames.map((un) => (
            <>
              <div
                key={un._id}
                className="p-2 m-1 rounded-full border-2 space-x-2"
              >
                <span
                  title={"Edit"}
                  onClick={() => {
                    setEditId(un._id);
                    setUsername(un.username);
                  }}
                  className="cursor-pointer text-xl inline-block hover:text-fuchsia-600"
                >
                  {un.username}
                </span>
                <TiDeleteOutline
                  size={30}
                  onClick={() => handleDeleteUsername(un._id)}
                  className="cursor-pointer inline-block hover:text-fuchsia-600"
                  title={"Remove"}
                />
              </div>
            </>
          ))}
        </div>
        <p
          onClick={() => rulesRef.current.classList.toggle("hidden")}
          className="inline-block text-2xl my-2 underline underline-offset-4 decoration-2 decoration-fuchsia-200 hover:decoration-fuchsia-400 cursor-pointer"
        >
          Username doesn&apos;t look right... Click here!
        </p>
        <ul className="text-xl list-disc hidden" ref={rulesRef}>
          <li>
            <b>Length:</b> Between 3 to 15 characters (varies by site).
          </li>
          <li>
            <b>Characters:</b>
            <ul className="text-xl list-inside list-disc">
              <li>Only alphanumeric characters (letters and numbers).</li>
              <li>
                Optional use of underscores (_), hyphens (-), or periods (.).
              </li>
            </ul>
          </li>
          <li>
            <b>No Spaces:</b> Spaces are usually not allowed.
          </li>
          <li>
            <b>Case Insensitive:</b> Usernames are often treated as
            case-insensitive.
          </li>
          <li>
            <b>No Special Characters:</b> Avoid special symbols (e.g., @, !, #).
          </li>
          <li>
            <b>Start/End with a Letter or Number:</b> Often, usernames cannot
            start or end with a special character.
          </li>
          <li>
            <b>Uniqueness:</b> Must be unique across the platform.
          </li>
        </ul>
        <p className="text-6xl mt-6 mb-2 text-right bg-gradient-to-l  from-fuchsia-400 to-fuchsia-800 bg-clip-text text-transparent">
          Usernamer
        </p>
        <p className="text-2xl my-2 text-justify">
          Usernamer provides AI-generated (Google Gemini) username suggestions for your web
          presence, allowing you to save, customize, and share them across
          platforms.
        </p>
      </div>
    </>
  );
};

export default App;
