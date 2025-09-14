import React, { useState } from "react";

function RegisterLogin() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center gap-4 w-[500px] mx-auto px-6 py-7 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold">
          {isLogin ? "Login to your account" : "Create your account "}
        </h2>
        <form className="flex flex-col gap-4 w-full">
          {!isLogin && (
            <div className="flex flex-col gap-4">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-4">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <div className="flex flex-col gap-4">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
          <button className="bg-blue-500 text-white rounded-xl p-2 focus:ring-blue-500">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <div className="mt-2 text-sm text-gray-600">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="text-blue-500 underline hover:text-blue-700"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </>
          ) : (
            <>
              You already have an account?{' '}
              <button
                type="button"
                className="text-blue-500 underline hover:text-blue-700"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterLogin;
