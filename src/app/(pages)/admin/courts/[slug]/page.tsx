"use client";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import CourtForm from "../form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const FETCH_COURT = gql`
  query FetchCourt($id: ID!) {
    fetchCourt(_id: $id) {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`

const Page = () => {
  const { slug } = useParams();
  const { data, loading } = useQuery(FETCH_COURT, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });
  const court = data?.fetchCourt;

  if (loading) return <Loader2 />;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <CourtForm id={slug as string} />
      </div>
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>{court?.name}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>
              <span className="font-semibold">Court Price: </span>
              <span>{court?.price.toFixed(2)}</span>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Page;
