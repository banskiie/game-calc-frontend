"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation"

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    username?: string;
  }

  interface Session {
    user?: User;
  }
}
const FETCH_USER = gql`
  query FetchUser($id: ID!) {
    fetchUser(_id: $id) {
      _id
      name
      contact
      username
      password
      role
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      _id
      name
      contact
      username
      password
      role
    }
  }
`;

const EditUserPage = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize useRouter
  const [countryCode, setCountryCode] = useState("+63");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("user");
  // const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const firstLetterName = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "N/A";
  const { data, loading } = useQuery(FETCH_USER, {
    variables: { id: session?.user?._id },
    skip: !session?.user?._id,
  });

  const [updateUser] = useMutation(UPDATE_USER);

  useEffect(() => {
    console.log("GraphQL Fetch User Response:", data);
    if (data?.fetchUser) {
      const user = data.fetchUser;
      setName(user.name);
      setUsername(user.username);
      setPhoneNumber(user.contact);
      setTimeout(() => {
        setRole(data.fetchUser.role || "user");
      }, 100);
    }
  }, [data]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})?$/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3] || ""}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const input: any = {
        _id: params.id || session?.user?._id,
        name,
        contact: phoneNumber,
        username,
        role,
      };

      console.log("EditUserPage params:", params);
      console.log("Session User ID:", session?.user?._id);

      if (newPassword) {
        input.password = newPassword;
      }

      console.log("Update Input:", input);

      const response = await updateUser({ variables: { input } });

      if (response.data.updateUser) {
        toast.success("User updated successfully!");
        router.push("/admin/profiles/")
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  if (loading) return <Loader2 />;

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col items-center">
      <div className="w-full h-52 bg-green-600 rounded-b-2xl relative flex justify-center"></div>

      <div className="relative -mt-16 w-32 h-32 bg-green-900 text-white flex items-center justify-center rounded-full border-4 border-white shadow-lg">
        <span className="text-5xl font-bold"> {firstLetterName} </span>
      </div>

      <Card className="w-11/12 max-w-md mt-6 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Username</label>
              <Input
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Contact No</label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-green-500">
                <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                  <SelectTrigger className="bg-gray-100 border-r p-3 text-gray-700 w-auto">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+63">+63</SelectItem>
                    <SelectItem value="+81">+81</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10 p-3 border-none"
                    placeholder="965-620-7152"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder={role || "Select a Role"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-green-800 hover:bg-green-700" type="submit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserPage;