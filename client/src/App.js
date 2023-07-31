import logo from "./logo.svg";
import "./App.css";
import axios from 'axios'
function App() {
  const handleTwitterSignIn = async () => {
    try {
      // Backend server URL for handling the OAuth callback
      const backendUrl = "https://twitter-auth-daniel.onrender.com/";

      // Initiate the OAuth 1.0a flow by making a request to the backend
      const response = await axios.get(`${backendUrl}/twitter/request-token`);

      // Redirect the user to the Twitter authorization URL
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error initiating Twitter sign-in:", error);
    }
  };
  return (
    <div>
      <h1>Get started, sign in with your Twitter account:</h1>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <button
          id="btnSignIn"
          onClick={handleTwitterSignIn}
           >
          {" "}
          Sign in with Twitter
        </button>
        <div
          id="loggedin"
          style={{ marginTop: 5, color: "#1E7EBE", fontSize: 10 }}
        >
          (You will sign in with the Twitter account your browser is{" "}
          <a
            href="https://twitter.com"
            target="_blank"
            style={{ textDecoration: "underline" }}
          >
            currently logged in
          </a>{" "}
          to.)
        </div>
        <div style={{ marginTop: 5, color: "#1E7EBE", fontSize: 11 }}>
          By signing in you agree to our{" "}
          <a
            href="/content/terms.php"
            style={{ color: "#1E7EBE" }}
            target="_blank"
          >
            terms of service
          </a>{" "}
          and{" "}
          <a
            href="/content/privacy.php"
            style={{ color: "#1E7EBE" }}
            target="_blank"
          >
            privacy policy
          </a>
        </div>
        <div class="alert alert-error" style={{ width: 46, marginTop: 30 }}>
          <div style={{ marginBottom: 5 }}>
            <a
              class="label label-info"
              href="https://status.twitter.com/"
              target="_blank"
            >
              Twitter is currently experiencing issues
            </a>
          </div>
          <div>
            If you cannot sign in to your Twitonomy account or if it does not
            work properly, please try again later...
          </div>
        </div>
        <div style={{ marginTop: 40 }}>&nbsp;</div>
      </div>
      <hr />
    </div>
  );
}

export default App;
