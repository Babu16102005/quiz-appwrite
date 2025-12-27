import { useEffect, useState } from "react";
import { account, avatars } from "./appwrite";
import Auth from "./Auth";
import Quiz from "./Quiz";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const hasSession = localStorage.getItem("hasSession");
    if (hasSession) {
      account.get()
        .then(setUser)
        .catch(() => {
          setUser(null);
          localStorage.removeItem("hasSession");
        });
    }
  }, []);

  const logout = async () => {
    await account.deleteSession("current");
    localStorage.removeItem("hasSession");
    setUser(null);
  };

  return (
    <div className="container">
      <h1>🧠 Real-Time Quiz Portal</h1>

      {!user ? (
        <Auth setUser={setUser} />
      ) : (
        <>
          <div className="profile-header">
            <div className="user-info">
              <img
                src={avatars.getInitials(user.name)}
                alt="Avatar"
                className="avatar"
              />
              <span className="username">Welcome, {user.name}</span>
            </div>
            <button className="primary-btn logout-btn" onClick={logout}>Logout</button>
          </div>
          <Quiz />
        </>
      )}
    </div>
  );
}

export default App;

