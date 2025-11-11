import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Chat from "./components/Chat";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-2xl flex justify-between items-center bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">Let's Connect💬</h1>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <SignedIn>
        <Chat />
      </SignedIn>

      <SignedOut>
        <p className="text-gray-600 text-center">
          Please sign in to start chatting.
        </p>
      </SignedOut>
    </div>
  );
};

export default App;
