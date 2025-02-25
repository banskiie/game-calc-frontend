"use client";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import UserForm from "../form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const FETCH_USER = gql`
  query FetchUser($id: ID!) {
    fetchUser(_id: $id) {
      _id
      name
      contact
      password
      username
      role
      active
      createdAt
      updatedAt
    }
  }
`;

const Page = () => {
  const { slug } = useParams()
  const { data, loading } = useQuery(FETCH_USER, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });
  const user = data?.fetchUser;

  if (loading) return <Loader2 />;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <UserForm id={slug as string} />
      </div>
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>
              <span className="font-semibold">Contact No: </span>
              <span>{user?.contact}</span>
            </span>
            <span>
              <span className="font-semibold">Username: </span>
              <span>{user?.username}</span>
            </span>
            <span>
              <span className="font-semibold">Role: </span>
              <span>{user?.role}</span>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
