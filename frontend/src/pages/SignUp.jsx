import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";

const SignUp = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isShow, setIsShow] = useState(false);
	const navigate = useNavigate();

	const handleSignup = async (e) => {
		e.preventDefault();

		// Validation check
		if (!firstName || !lastName || !email || !password) {
			toast.error("All fields are required");
			return;
		}

		toast.loading("Signing up...");

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ firstName, lastName, email, password }),
				}
			);

			const text = await response.text();
			if (!text) throw new Error("Empty response from server");

			const json = JSON.parse(text);

			toast.dismiss();

			if (response.ok) {
				toast.success(json.message);
				navigate("/signin");
			} else {
				toast.error(json.message);
			}
		} catch (error) {
			toast.dismiss();
			toast.error("Signup failed: " + error.message);
		}
	};

	return (
		<div className="flex flex-col items-center my-6 text-slate-300 min-h-[80vh]">
			<div className="p-4 w-[80%] sm:w-[50%] lg:w-[40%] border border-gray-400 bg-gray-800 rounded-lg mt-5">
				<h2 className="text-2xl font-semibold text-center text-white mb-4">
					Sign Up for ChatApp
				</h2>
				<form onSubmit={handleSignup} className="flex flex-col">
					<input
						className="my-2 p-3 border rounded-lg bg-white text-black"
						type="text"
						placeholder="First Name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<input
						className="my-2 p-3 border rounded-lg bg-white text-black"
						type="text"
						placeholder="Last Name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
					<input
						className="my-2 p-3 border rounded-lg bg-white text-black"
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<div className="relative">
						<input
							className="my-2 p-3 border rounded-lg w-full bg-white text-black"
							type={isShow ? "text" : "password"}
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<span
							onClick={() => setIsShow(!isShow)}
							className="absolute right-4 top-5 cursor-pointer text-gray-600"
						>
							{isShow ? <PiEyeClosedLight fontSize={22} /> : <PiEye fontSize={22} />}
						</span>
					</div>
					<button
						type="submit"
						className="mt-4 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Sign Up
					</button>
					<p className="mt-3 text-center">
						Already have an account?{" "}
						<Link to="/signin" className="text-blue-400 hover:underline">
							Sign In
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default SignUp;
